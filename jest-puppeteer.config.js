module.exports = {
    launch: {
        dumpio: true,
        headless: true,
        //process.env.HEADLESS !== "false",
    },
    server: {
        command: "yarn start",
        port: 3000,
        launchTimeout: 40000,
    },
}
