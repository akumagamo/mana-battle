import { PUBLIC_URL, SCENES } from "../constants"
import create from "./create"

const { CHARA_CREATION_SCENE } = SCENES

export default class CharaCreationScene extends Phaser.Scene {
    constructor() {
        super(CHARA_CREATION_SCENE)
    }
    preload() {
        if (process.env.SOUND_ENABLED) {
            const id = "jshaw_dream_of_first_flight"
            this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`)
        }
    }
    create() {
        create(this)
    }
}
