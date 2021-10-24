import { sceneMock } from "../../test/mocks"
import createUnit from "../../Unit/createUnit"
import createChara from "../createChara"
import selectChara from "./selectChara"

const chara = () => createChara({ scene: sceneMock(), unit: createUnit() })

it("should create an image in the `selectedCharaIndicator` property", () => {
    const chara_ = chara()
    selectChara(chara_)

    expect(chara_.selectedCharaIndicator).toMatchObject({ __type__: "image" })
})
