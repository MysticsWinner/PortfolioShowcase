const { spawn } = require('child_process');

console.log('Starting frontend server...');
const child = spawn('npm', ['run', 'dev'], { shell: true, cwd: __dirname });

child.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`STDERR: ${data}`);
});

setTimeout(() => {
  console.log('Test complete, killing server...');
  child.kill();
  process.exit(0);
}, 15000);
