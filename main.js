const { app, Tray, Menu } = require('electron');
const nativeImage = require('electron').nativeImage;
const path = require('path');
const fs = require('fs');

const updateIconStatus = require('./functions/updateIconStatus');
const getLightStatus = require('./functions/getLightStatus');
const updateLightStatus = require('./functions/updateLightStatus');
const sendStatusNotification = require('./functions/notifications/sendStatusNotification');
const sendErrorNotification = require('./functions/notifications/sendErrorNotification');
const updateLightPreset = require('./functions/updateLightPreset');

const configFile = fs.readFileSync('config.json', 'utf-8');
const config = JSON.parse(configFile);

let tray = null;
let isLightOn = false;

app.on('ready', async () => {
  // Cria a bandeja com o ícone padrão (apagada)
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon_off.png')).resize({ width: 16 }));

  // Obtém o estado atual da lâmpada assim que o programa for iniciado
  try {
    isLightOn = await getLightStatus();
    updateIconStatus(isLightOn, tray);
  } catch (error) {
    sendErrorNotification('Ocorreu um erro', error);
  }

  // Cria um array de objetos com os presets
  const presetSubMenuItems = Object.entries(config.presets).map(([presetName, presetValue]) => {
    return {
      label: presetName,
      click: async () => {
        // Executa a ação de alterar o preset
        updateLightPreset(presetName, presetValue);
      }
    };
  });

  // Cria um menu de contexto para a bandeja
  const contextMenu = Menu.buildFromTemplate([
    {
      icon: nativeImage.createFromPath('icon_on.png').resize({ width: 16 }),
      label: 'Ligar Luz',
      click: async () => {
        // Executa a ação de ligar a luz
        isLightOn = await updateLightStatus(true);

        sendStatusNotification(isLightOn);
        updateIconStatus(isLightOn, tray);
      }
    },
    {
      icon: nativeImage.createFromPath(path.join(__dirname, 'icon_off.png')).resize({ width: 16 }),
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
      icon: nativeImage.createFromPath(path.join(__dirname, 'icon_preset.png')).resize({ width: 16 }),
      label: 'Presets',
      submenu: presetSubMenuItems
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.quit();
      }
    }
  ]);

  // Define o menu de contexto para a bandeja
  tray.setContextMenu(contextMenu);
});
