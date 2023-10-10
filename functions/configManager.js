const fs = require('fs');

let config = require('../config.json');

// Função para carregar as configurações atuais
function loadConfig() {
  try {
    delete require.cache[require.resolve('../config.json')];
    config = require('../config.json');
  } catch (error) {
    console.error('Erro ao recarregar config.json:', error);
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
