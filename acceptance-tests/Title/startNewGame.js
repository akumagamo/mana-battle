const clickButton = require("../DSL/clickButton");
const utils = require("../utils");
module.exports = async (page) => {
  clickButton(1280 / 2, 520, page);

  const titleSceneActive = await utils.isSceneActive("TitleScene", page);
  utils.assert("should exit TitleScene", !titleSceneActive);

  const charaCreationSceneActive = await utils.isSceneActive(
    "CharaCreationScene",
    page
  );
  utils.assert("should enter CharaCreationScene", charaCreationSceneActive);
};
