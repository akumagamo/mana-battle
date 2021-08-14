import { SCENES } from "../constants"

const { CHARA_CREATION_SCENE } = SCENES

export default (scene: Phaser.Scene) => {
    scene.scene.start(CHARA_CREATION_SCENE)
}
