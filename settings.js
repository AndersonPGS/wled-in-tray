const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const hostInput = document.getElementById('hostInput');
  const presetsContainer = document.getElementById('presetsContainer');
  const addPresetButton = document.getElementById('addPresetButton');
  const saveButton = document.getElementById('saveButton');

  // Ouça o evento loadConfig e preencha os inputs com os valores
  ipcRenderer.on('loadConfig', (event, config) => {
    hostInput.value = config.host;

    // Limpe os presets existentes
    presetsContainer.innerHTML = '';

    // Preencha os presets a partir do objeto de configuração
    for (const [presetName, presetValue] of Object.entries(config.presets)) {
      addPresetFields(presetName, presetValue);
    }
  });

  addPresetButton.addEventListener('click', () => {
    addPresetFields();
  });

  saveButton.addEventListener('click', () => {
    const host = hostInput.value;

    const presets = {};
    const presetContainers = document.querySelectorAll('.preset-container');
    presetContainers.forEach((presetContainer) => {
      const nameInput = presetContainer.querySelector('input[type="text"]');
      const idInput = presetContainer.querySelector('input[type="number"]');
      const name = nameInput.value;
      const id = parseInt(idInput.value);
      if (name && !isNaN(id)) {
        presets[name] = id;
      }
    });

    const config = {
      host,
      presets,
    };

    // Envie a configuração atualizada para o processo principal
    ipcRenderer.send('saveConfig', config);

    // Envie uma mensagem para fechar a janela principal
    ipcRenderer.send('closeSettings');
  });

  // Função para adicionar campos de entrada para presets com valores
  function addPresetFields(name = '', id = '') {
    const presetDiv = document.createElement('div');
    presetDiv.classList.add('preset-container');
  
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Nome';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = name; // Preencha o valor do nome
  
    const idLabel = document.createElement('label');
    idLabel.textContent = 'ID';
    const idInput = document.createElement('input');
    idInput.type = 'number';
    idInput.value = id; // Preencha o valor do ID
  
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="material-icons">delete</i>';
    deleteButton.addEventListener('click', () => {
      // Adicione aqui a lógica para remover o contêiner de preset quando o botão for clicado
      presetDiv.remove();
    });
  
    presetDiv.appendChild(nameLabel);
    presetDiv.appendChild(nameInput);
    presetDiv.appendChild(idLabel);
    presetDiv.appendChild(idInput);
    presetDiv.appendChild(deleteButton);
  
    presetsContainer.appendChild(presetDiv);
  }
});
