const baseConfig = {
  launch: {
    dumpio: true,
    headless: true,
  }
}

const ciConfig = process.env.CI ?
  {
    server: {
      command: "yarn test-server",
      port: 3333,
      launchTimeout: 20000,
    }
  } : {}

module.exports = {...baseConfig, ...ciConfig}
