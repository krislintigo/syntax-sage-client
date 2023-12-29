module.exports = {
  apps: [
    {
      name: 'SS-C',
      port: '4001',
      instances: '1',
      script: './.output/server/index.mjs',
    },
  ],
}
