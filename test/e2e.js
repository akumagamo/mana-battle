const puppeteer = require("puppeteer");

(() => {
  puppeteer
    .launch({
      headless: true,
    })
    .then((browser) => {
      browser.newPage().then((page) => {
        page
          .on("console", (message) => console.log(message.text()))
          .on("pageerror", ({ message }) => {
            console.log(message);

            page
              .screenshot({
                path: "test/screens/" + new Date().getTime() + ".png",
              })
              .then(() => browser.close());
          });

        // setInterval(
        //   () => page.screenshot({ path: 'test/'+ new Date().getTime() + ".png" }),
        //   10000
        // );

        page.goto("http://localhost:3000").then(() => {
          setTimeout(() => {
            browser.close();
          }, 30000);
        });
      });
    });
})();
