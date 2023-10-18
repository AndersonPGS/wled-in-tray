const { spawn } = require('child_process');
const path = require('path');

// Substitua 'C:\\caminho\\para\\electron' pelo caminho real do executável do Electron em seu sistema.
const electronPath = 'C:\\Users\\anderson\\dev\\bedroom_center\\node_modules\\.bin\\electron.cmd';

const electron = spawn(electronPath, [path.join(__dirname, 'main.js')]);

electron.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

electron.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

electron.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
