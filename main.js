const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const nativeImage = require('electron').nativeImage;
const path = require('path');
const fs = require('fs');

const configManager = require('./functions/configManager');
const updateIconStatus = require('./functions/updateIconStatus');
const getLightStatus = require('./functions/getLightStatus');
const updateLightStatus = require('./functions/updateLightStatus');
const sendStatusNotification = require('./functions/notifications/sendStatusNotification');
const sendErrorNotification = require('./functions/notifications/sendErrorNotification');
const updateLightPreset = require('./functions/updateLightPreset');

let tray = null;
let settingsWindow;
let isLightOn = false;
let verifier = null

app.on('ready', () => {
  const config = configManager.getConfig();

  // Cria um ícone de Tray
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/images/', 'icon_off.png')).resize({ width: 16 }));

  // Configura o menu de contexto
  createTrayContextMenu();

  // Verifica se é a primeira inicialização
  initializeLightStatus(config);

  // Checa o status da luz a cada 10 minutos
  verifier = setInterval(checkLightStatus, 10 * 60 * 1000);
});


function createTrayContextMenu() {
  let presetSubMenuItems = createPresetSubMenuItems();
  
  let contextMenu = Menu.buildFromTemplate([
    {
      icon: nativeImage.createFromPath(path.join(__dirname, '/images/' ,'icon_on.png')).resize({ width: 16 }),
      label: 'Ligar Luz',
      click: async () => {
        await handleLightStatusUpdate(true);
      }
    },
    {
      icon: nativeImage.createFromPath(path.join(__dirname, '/images/' ,'icon_off.png')).resize({ width: 16 }),
      label: 'Desligar Luz',
      click: async () => {
        await handleLightStatusUpdate(false);
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
      click: openSettingsWindow,
    },
    {
      icon: nativeImage.createFromPath(path.join(__dirname, '/images/' ,'icon_close.png')).resize({ width: 16 }),
      label: 'Sair',
      click: () => {
        clearInterval(verifier)
        app.quit();
        if (settingsWindow) {
          settingsWindow.close();
        }
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function createPresetSubMenuItems() {
  return Object.entries(configManager.getConfig().presets).map(([presetName, presetValue]) => {
    return {
      label: presetName,
      click: async () => {
        await updateLightPreset(presetName, presetValue);
        checkLightStatus()
      }
    };
  });
}

async function initializeLightStatus(config) {
  try {
    if (config.host) {
      isLightOn = await getLightStatus();
      updateIconStatus(isLightOn, tray);
    } else {
      sendErrorNotification('Primeira Inicialização?', 'Adicione o Hostname para usar o programa corretamente.');
      openSettingsWindow();
    }
  } catch (error) {
    sendErrorNotification('Ocorreu um erro', error);
  }
}

async function checkLightStatus() {
  const config = configManager.getConfig();
  try {
    if (config.host) {
      isLightOn = await getLightStatus();
      updateIconStatus(isLightOn, tray);
    }
  } catch (error) {
    return;
  }
}

async function handleLightStatusUpdate(turnOn) {
  isLightOn = await updateLightStatus(turnOn);
  sendStatusNotification(isLightOn);
  updateIconStatus(isLightOn, tray);
}

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

  settingsWindow.loadFile('settings.html');

  settingsWindow.webContents.on('did-finish-load', () => {
    settingsWindow.webContents.send('loadConfig', configManager.getConfig());
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  settingsWindow.on('close', (event) => {
    // event.preventDefault();
    settingsWindow.hide();
  });

  ipcMain.on('saveConfig', (event, config) => {
    // Salve as informações no arquivo config.json
    const configPath = path.join(__dirname, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    configManager.loadConfig()
    createTrayContextMenu();
  });

  ipcMain.on('closeSettings', () => {
    if (settingsWindow) {
      settingsWindow.hide(); // Oculte a janela de configurações
    }
  });
}
