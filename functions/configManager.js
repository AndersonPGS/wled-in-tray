const fs = require('fs');

let config = require('../config.json');
const sendErrorNotification = require('./notifications/sendErrorNotification');

// Função para carregar as configurações atuais
function loadConfig() {
  try {
    delete require.cache[require.resolve('../config.json')];
    config = require('../config.json');
  } catch (error) {
    sendErrorNotification('Ocorreu um erro ao carregar o JSON', error);
    return
  }
}

// Inicialmente, carregue as configurações
loadConfig();

// Exporte as configurações e a função para recarregá-las
module.exports = {
  getConfig: () => config,
  loadConfig,
};
