import { sceneMock } from "../../test/mocks";
import { makeUnit } from "../../Unit/makeUnit";
import createChara from "../createChara";
import selectChara from "./selectChara";

const chara = () => createChara({ parent: sceneMock(), unit: makeUnit({}) });

it("should create an image in the `selectedCharaIndicator` property", () => {
  const chara_ = chara();
  selectChara(chara_);

  expect(chara_.selectedCharaIndicator).toMatchObject({__type__:"image"})
});
