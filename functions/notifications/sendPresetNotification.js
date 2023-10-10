const { Notification } = require('electron');
const path = require('path');

// Mostra uma notificação com base no novo estado da lâmpada
function sendPresetNotification(presetName) {
  const notificationPreset = new Notification({
    title: `Preset ${presetName}`,
    body: 'O preset foi aplicado com sucesso.',
    icon: path.join(__dirname, '../../images/', 'icon_preset.png'),
    silent: true,
  });

  notificationPreset.show();
}

module.exports = sendPresetNotification
