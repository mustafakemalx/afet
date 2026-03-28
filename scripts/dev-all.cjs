const { spawn } = require('node:child_process');

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options,
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

const backend = run('api', 'node', ['api/index.js'], {
  env: { ...process.env, PORT: '5001' },
});

const frontend = run('web', 'npm', ['run', 'dev:web']);

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
