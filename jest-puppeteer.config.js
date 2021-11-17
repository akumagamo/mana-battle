module.exports = {
    launch: {
        dumpio: false,
        headless: true,
        //process.env.HEADLESS !== "false",
    },
    server: {
        command: "yarn start",
        port: 3333,
        launchTimeout: 40000,
    },
}
