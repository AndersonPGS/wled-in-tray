const { Notification } = require('electron');
const path = require('path');

// Mostra uma notificação com base no novo estado da lâmpada
function sendStatusNotification(isLightOn) {
  const notification = new Notification({
    title: isLightOn ? 'Luz Ligada' : 'Luz Desligada',
    body: isLightOn ? 'A luz do quarto está ligada.' : 'A luz do quarto está desligada.',
    icon: isLightOn ? path.join(__dirname, '../../images/', 'icon_on.png') : path.join(__dirname, '../../images/', 'icon_off.png'),
    silent: true,
  });

  notification.show();
}

module.exports = sendStatusNotification
