import { Unit } from "../../Unit/Model"
import { CharaCreationState } from "../Model"
import { getDOMElementById } from "../../Browser/getDOMElementById"

export default function (scene: Phaser.Scene, state: CharaCreationState) {
    const name: string = (<HTMLInputElement>getDOMElementById("new-chara-name"))
        .value
    const unit: Unit = { ...state.unit, name }

    state.container.destroy()
    scene.scene.stop()

    // TEST CODE

    console.log(`saving to disk...`, unit)

    //const json = localStorage.getItem("saves") || "[]"
    //const saveSlots = (JSON.parse(json) as SaveFile[]) || []

    // saveSlots.push({
    //     date: new Date().getTime(),
    //     hero: unit,
    // })

    // console.log(saveSlots)
    // localStorage.setItem("saves", JSON.stringify(saveSlots))
}
