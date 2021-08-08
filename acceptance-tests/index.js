const puppeteer = require("puppeteer");
const openGame = require("./Game/openGame");
const startNewGame = require("./Title/startNewGame");
const utils = require("./utils");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1280,
      height: 720,
    },
  });

  const page = await browser.newPage();

  page
    .on("console", (message) => {
      if (message.text() === "TEST FINISHED") browser.close();

      console.log(message.text());
    })
    .on("pageerror", ({ message }) => {
      console.log(message);

      page
        .screenshot({
          path: "test/screens/" + new Date().getTime() + ".png",
        })
        .then(() => browser.close());
    });

  await openGame(page);

  startNewGame(page);

  await utils.wait(1000);

  browser.close();
})();
