const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const nativeImage = require('electron').nativeImage;
const path = require('path');
const fs = require('fs');

const updateIconStatus = require('./functions/updateIconStatus');
const getLightStatus = require('./functions/getLightStatus');
const updateLightStatus = require('./functions/updateLightStatus');
const sendStatusNotification = require('./functions/notifications/sendStatusNotification');
const sendErrorNotification = require('./functions/notifications/sendErrorNotification');
const updateLightPreset = require('./functions/updateLightPreset');
const configManager = require('./functions/configManager');

let tray = null;
let settingsWindow;
let isLightOn = false;

app.on('ready', async () => {
  let config = configManager.getConfig();
  function openSettingsWindow() {
    settingsWindow = new BrowserWindow({
      width: 400,
      height: 600,
      modal: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    // Carregue a página de configurações
    settingsWindow.loadFile('settings.html');
    
    // Passe as configurações para a janela de configurações
    settingsWindow.webContents.on('did-finish-load', () => {
      settingsWindow.webContents.send('loadConfig', configManager.getConfig());
    });

    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });

    settingsWindow.on('close', (event) => {
      // event.preventDefault(); // Evite que a janela seja destruída
      settingsWindow.hide(); // Oculte a janela em vez de fechá-la
    });
  }

  // Ouça o evento saveConfig da página de configurações
  ipcMain.on('saveConfig', (event, config) => {
    // Salve as informações no arquivo config.json
    const configPath = path.join(__dirname, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    configManager.loadConfig()
    updateTrayContextMenu();
  });

  ipcMain.on('closeSettings', () => {
    if (settingsWindow) {
      settingsWindow.hide(); // Oculte a janela de configurações
    }
  });

  // Cria a bandeja com o ícone padrão (apagada)
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/images/', 'icon_off.png')).resize({ width: 16 }));

  // Obtém o estado atual da lâmpada assim que o programa for iniciado
  try {
    config = configManager.getConfig();
    if (config.host) {
      isLightOn = await getLightStatus();
      updateIconStatus(isLightOn, tray);
    } else {
      // Lida com o caso em que config.host não está definido
      sendErrorNotification('Primeira Inicialização?', 'Adicione o Hostname para conseguir utilizar o programa corretamente.');
      openSettingsWindow()
    }
  } catch (error) {
    sendErrorNotification('Ocorreu um erro', error);
  }

  // Cria um array de objetos com os presets
  config = configManager.getConfig();
  const presetSubMenuItems = Object.entries(config.presets).map(([presetName, presetValue]) => {
    return {
      label: presetName,
      click: async () => {
        // Executa a ação de alterar o preset
        updateLightPreset(presetName, presetValue);
      }
    };
  });

  
  // Cria e atualiza um menu de contexto para a bandeja
  function createPresetSubMenuItems() {
    const config = configManager.getConfig();
    const presetSubMenuItems = Object.entries(config.presets).map(([presetName, presetValue]) => {
      return {
        label: presetName,
        click: async () => {
          // Executa a ação de alterar o preset
          updateLightPreset(presetName, presetValue);
        }
      };
    });
  
    return presetSubMenuItems;
  }
  
  function updateTrayContextMenu() {
    const presetSubMenuItems = createPresetSubMenuItems();

    const contextMenu = Menu.buildFromTemplate([
      {
        icon: nativeImage.createFromPath(path.join(__dirname, '/images/' ,'icon_on.png')).resize({ width: 16 }),
        label: 'Ligar Luz',
        click: async () => {
          // Executa a ação de ligar a luz
          isLightOn = await updateLightStatus(true);

          sendStatusNotification(isLightOn);
          updateIconStatus(isLightOn, tray);
        }
      },
      {
        icon: nativeImage.createFromPath(path.join(__dirname, '/images/' ,'icon_off.png')).resize({ width: 16 }),
        label: 'Desligar Luz',
        click: async () => {
          // Executa a ação de desligar a luz
          isLightOn = await updateLightStatus(false);

          sendStatusNotification(isLightOn);
          updateIconStatus(isLightOn, tray);
        }
      },
      { type: 'separator' },
      {
        icon: nativeImage.createFromPath(path.join(__dirname, '/images/' ,'icon_preset.png')).resize({ width: 16 }),
        label: 'Presets',
        submenu: presetSubMenuItems
      },
      { type: 'separator' },
      {
        icon: nativeImage.createFromPath(path.join(__dirname, '/images/' ,'icon_config.png')).resize({ width: 16 }),
        label: 'Configurações',
        click: () => {
          // Abrir a página de configurações quando o item de menu for clicado
          openSettingsWindow();
        },
      },
      {
        icon: nativeImage.createFromPath(path.join(__dirname, '/images/' ,'icon_close.png')).resize({ width: 16 }),
        label: 'Sair',
        click: () => {
          clearInterval(verifier)
          app.quit();
          if (settingsWindow) {
            settingsWindow.close(); // Feche a janela de configurações se estiver aberta
          }
        }
      }
    ]);

    // Define o menu de contexto para a bandeja
    tray.setContextMenu(contextMenu);
  }

  // Chame essa função para criar o menu de contexto inicial
  updateTrayContextMenu();



  // Verifica o estado da lampada a cada 10 minutos
  var verifier = setInterval(async () => {
    config = configManager.getConfig();
    try {
      if (config.host) {
        isLightOn = await getLightStatus();
        updateIconStatus(isLightOn, tray);
      }
    } catch (error) {
      return
    }
  }, 1 * 60 * 1000)
});
