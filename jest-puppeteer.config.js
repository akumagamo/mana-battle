module.exports = {
    launch: {
        dumpio: false,
        headless: true,
        //process.env.HEADLESS !== "false",
    },
    server: {
        command: "yarn test-server",
        port: 3333,
        launchTimeout: 20000,
    },
}
