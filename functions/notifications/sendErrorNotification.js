const { Notification } = require('electron');
const path = require('path');

// Mostra uma notificação com base no novo estado da lâmpada
function sendErrorNotification(title, error) {
  if (!error) return

  const notificationError = new Notification({
    title: title,
    body: error,
    icon: path.join(__dirname, '../../', 'icon_error.png'),
    silent: false,
  });

  notificationError.show();
}

module.exports = sendErrorNotification
