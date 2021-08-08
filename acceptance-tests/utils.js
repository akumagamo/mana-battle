const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};
const screenshot = (name, page) => {
  page.screenshot({ path: `acceptange-tests/screens/${name}.png` });
};
const isSceneActive = async (key, page) => {
  return await page.evaluate(() =>
    window.game.scene.getScene(key).sys.isActive()
  );
};

const assert = (description, cond) => {
  if (!cond) throw new Error(description);
  else console.log(`SUCCESS: ${cond}`);
};

module.exports = { assert, wait, screenshot, isSceneActive };
