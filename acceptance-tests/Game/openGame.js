const { wait } = require("../utils");

module.exports = async (page) => {
  await page.goto("http://localhost:3000");
};
