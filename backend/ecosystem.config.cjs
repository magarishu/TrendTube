module.exports = {
  apps: [{
    name: 'trendtube-backend',
    script: 'server.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster', // Enables clustering/load balancing
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    time: true
  }]
};
