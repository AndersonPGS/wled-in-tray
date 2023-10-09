const http = require('http');
const sendErrorNotification = require('./notifications/sendErrorNotification');

const config = require('../config.json');
const sendPresetNotification = require('./notifications/sendPresetNotification');

// Função para enviar solicitações HTTP para ligar ou desligar a luz
function updateLightPreset(presetName, presetId) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({ ps: presetId});
    const options = {
      hostname: config.host,
      port: 80,
      path: `/json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = ''; // Inicialize uma variável para armazenar o corpo da resposta

      // Registre o evento 'data' para receber os dados da resposta
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      // Registre o evento 'end' para indicar que todos os dados foram recebidos
      res.on('end', () => {
        // Verifique o status code
        if (res.statusCode === 200) {
          try {
            const responseJson = JSON.parse(responseData);

            // Verifique se o JSON possui uma chave "success" com o valor true
            if (responseJson.success === true) {
              // O status code é 200 e o JSON possui { "success": true }, então resolva com sucesso

              sendPresetNotification(presetName)
              resolve();
            } else {
              // Caso contrário, rejeite com um erro
              const error = new Error(`Erro no JSON: "success" não é true. Status Code: ${res.statusCode}, Body: ${responseData}`);
              sendErrorNotification('Erro ao atualizar o estado', error.message);
              reject();
            }
          } catch (error) {
            const parsingError = new Error(`Erro ao analisar JSON. Status Code: ${res.statusCode}, Body: ${responseData}`);
            sendErrorNotification('Erro ao atualizar o estado', parsingError.message);
            reject(parsingError);
          }
        } else {
          // Caso contrário, rejeite com um erro
          const error = new Error(`Erro na resposta. Status Code: ${res.statusCode}, Body: ${responseData}`);
          sendErrorNotification('Erro ao atualizar o estado', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      sendErrorNotification('Erro ao atualizar o estado', `${error.name}: ${error.message}`);
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

module.exports = updateLightPreset