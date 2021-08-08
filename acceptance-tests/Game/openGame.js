module.exports = (page) =>
  new Promise(async (resolve) => {
    await page.goto("http://localhost:3000");
    setTimeout(() => {
      resolve();
    }, 1000);
  });
