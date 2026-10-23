module.exports = {
  apps: [
    {
      name: 'kennedys-web',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/kennedys-web',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.kennedys.group/api',
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyDEDh_4guY9M-yuS1d76aqHStxAYt7LSlM',
        NEXT_PUBLIC_BASE_URL: 'https://villasforrent.kennedysgroup.com'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.kennedys.group/api',
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyDEDh_4guY9M-yuS1d76aqHStxAYt7LSlM',
        NEXT_PUBLIC_BASE_URL: 'https://villasforrent.kennedysgroup.com'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.kennedys.group/apix',
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyDEDh_4guY9M-yuS1d76aqHStxAYt7LSlM',
        NEXT_PUBLIC_BASE_URL: 'https://villasforrent.kennedysgroup.com'
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'kennedys.group',
      ref: 'origin/main',
      repo: 'https://bitbucket.org/thefuzzyteam/kennedys-web.git',
      path: '/home/ubuntu/kennedys-web',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
