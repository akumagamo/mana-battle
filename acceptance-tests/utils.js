const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};
const screenshot = (name, page) => {
  page.screenshot({ path: `acceptange-tests/screens/${name}.png` });
};
const isSceneActive = async (key, page) => {
  return await page.evaluate((k) => {
    return window.game.scene.getScene(k).sys.isActive();
  }, key);
};

const assert = (description, cond) => {
  if (!cond)
    throw new Error(
      `❌ ${description} - expected ${cond} but got ${!cond}`
    );
  else console.log(`✅ ${description}`);
};

module.exports = { assert, wait, screenshot, isSceneActive };
