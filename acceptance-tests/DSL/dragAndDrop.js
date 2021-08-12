module.exports = async (from, to, page) => {
  await page.waitForTimeout(300);
  page.mouse.move(from.x, from.y);
  page.mouse.down();

  await page.waitForTimeout(100);
  page.mouse.move(to.x, to.y);

  await page.waitForTimeout(100);
  page.mouse.up();
};
