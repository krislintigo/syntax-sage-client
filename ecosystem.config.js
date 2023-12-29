export default {
  apps: [
    {
      name: 'SS-C',
      port: '4001',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
    },
  ],
}
