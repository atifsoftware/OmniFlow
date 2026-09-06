module.exports = {
  apps: [
    {
      name: 'omniflow-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',
      instances: 'max', // Multi-core cluster mode: spawns 1 worker per CPU core
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
