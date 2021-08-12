const puppeteer = require("puppeteer");
const click = require("./DSL/click");
const dragAndDrop = require("./DSL/dragAndDrop");
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

  page.on("pageerror", ({ message }) => {
    console.log(message);

    page
      .screenshot({
        path: "screens/" + new Date().getTime() + ".png",
      })
      .then(() => browser.close());
  });

  console.log(`Starting tests`);

  await openGame(page);

  await page.waitForTimeout(1000);

  await startNewGame(page);

  await page.waitForTimeout(2000);

  await page.$eval("#new-chara-name", (el) => (el.value = "Khastan"));

  await click(1280 - 100, 720 - 100, page);

  await page.waitForTimeout(2000);

  await click(140, 31, page); // open organize

  await page.waitForTimeout(200);

  await click(495, 190, page); // open click middle squad

  await click(1088, 655, page); // click edit

  // await click(1088, 655, page); // click edit

  // await dragAndDrop({ x: 67, y: 272 }, { x: 520, y: 180 }, page); // drag list chara to board

  // await click(1158, 699, page); // click confirm

  // await click(820, 190, page); // click last squad

  // await click(463, 656, page); // click disband

  // await click(1121, 41, page); // click confirm

  // await page.waitForTimeout(200);

  // console.log(`Tests finished`);

  // await browser.close();
})();
