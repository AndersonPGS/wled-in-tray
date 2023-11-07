const { spawn } = require('child_process');
const path = require('path');

const electronPath = 'C:\\Users\\anderson\\dev\\bedroom_center\\node_modules\\.bin\\electron.cmd';

const electron = spawn(electronPath, [path.join(__dirname, 'main.js')], {
  detached: true,
  stdio: 'ignore', // Redireciona a saída padrão para 'ignore'
  shell: true, // Use o shell para executar o processo
});

electron.unref();

electron.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
