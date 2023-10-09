const path = require('path');
const nativeImage = require('electron').nativeImage
// Define o ícone da bandeja (system tray) de acordo com o estado da lâmpada
function updateIconStatus (isLightOn, tray) {
  const iconPath = isLightOn ? 'icon_on.png' : 'icon_off.png';
  tray.setImage(nativeImage.createFromPath(path.join(__dirname, "../", iconPath)).resize({width:16}));
}

module.exports = updateIconStatus