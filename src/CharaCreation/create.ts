import { GAME_SPEED } from "../env"
import { UNIT_JOBS } from "../Unit/Model"
import { CharaCreationState, initialUnit } from "./Model"
import background from "./rendering/background"
import Chara from "./rendering/Chara"
import confirmButton from "./rendering/confirmButton"
import createRadio from "./rendering/formField/radio"
import createFormField from "./rendering/formField/select"
import nameInput from "./rendering/nameInput"
import refreshChara from "./rendering/refreshChara"

export default function (scene: Phaser.Scene) {
    if (process.env.SOUND_ENABLED) {
        scene.sound.stopAll()
        const music = scene.sound.add("jshaw_dream_of_first_flight")
        music.play()
    }
    scene.cameras.main.fadeIn(1000 / GAME_SPEED)

    const state: CharaCreationState = {
        unit: initialUnit,
        container: scene.add.container(),
        chara: Chara(scene, initialUnit),
    }

    background(scene, state)

    nameInput(scene, 430, 50)

    classInput(scene, state)

    confirmButton(scene, state)
}

function classInput(scene: Phaser.Scene, state: CharaCreationState) {
    createRadio(
        scene,
        state.container,
        430,
        550,
        570,
        "Class",
        "job",
        UNIT_JOBS,
        { fighter: "Fighter", archer: "Archer", mage: "Mage" },
        (a: any, b: any) => {
            state.unit = { ...state.unit, [a]: b }
            refreshChara(scene, state)
        }
    )
}
