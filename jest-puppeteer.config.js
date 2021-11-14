module.exports = {
    launch: {
        dumpio: false,
        headless: true,
        //process.env.HEADLESS !== "false",
    },
    server: {
        command: "yarn start",
        port: 3000,
        launchTimeout: 40000,
    },
}
