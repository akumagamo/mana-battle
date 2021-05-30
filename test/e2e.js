const puppeteer = require("puppeteer");

(() => {
  puppeteer
    .launch({
      headless: true,
    })
    .then((browser) => {
      browser.newPage().then((page) => {
        page.on("console", (message) => console.log(message.text()));

        // setInterval(
        //   () => page.screenshot({ path: 'test/'+ new Date().getTime() + ".png" }),
        //   10000
        // );

        page.goto("http://localhost:3000").then(() => {
          setTimeout(() => {
            browser.close();
          }, 24000);
        });
      });
    });
})();
