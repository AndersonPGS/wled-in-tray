const http = require('http');
const sendErrorNotification = require('./notifications/sendErrorNotification');

const config = require('../config.json')

// Função para obter o estado atual da lâmpada
function getLightStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: 80,
      path: '/json',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          // Recebe a resposta JSON
          const data = JSON.parse(responseData);

          // Verifique o valor da chave "on" para determinar o estado da lâmpada
          const isLightOn = data && data.state.on === true;

          resolve(isLightOn);
        } catch (error) {
          sendErrorNotification('Erro ao analisar a resposta JSON', `${error.name}: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      sendErrorNotification('Erro ao verificar o estado', `${error.name}: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

module.exports = getLightStatus;
