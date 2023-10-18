const http = require('http');
const sendErrorNotification = require('./notifications/sendErrorNotification');
const configManager = require('./configManager');


// Função para obter o estado atual da lâmpada
function getLightStatus() {
  return new Promise((resolve, reject) => {
    const config = configManager.getConfig();
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
        // Verifique se a resposta é uma string válida
        if (typeof responseData === 'string') {
          try {
            responseData = responseData.replace("\\","");
            const data = JSON.parse(responseData);
            // Verifique se data.state.on é um booleano
            if (data && data.state && typeof data.state.on === 'boolean') {
              const isLightOn = data.state.on;
              resolve(isLightOn);
            } else {
              sendErrorNotification('Resposta JSON inválida', 'A resposta não contém o formato esperado.');
              reject(new Error('Resposta JSON inválida'));
            }
          } catch (error) {
            sendErrorNotification('Erro ao analisar a resposta JSON', `${error.name}: ${error.message}`);
            reject(error);
          }
        } else {
          sendErrorNotification('Resposta inválida', 'A resposta não é uma string válida.');
          reject(new Error('Resposta inválida'));
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
