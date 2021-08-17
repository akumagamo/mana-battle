import { CharaIndex } from "../Chara/Model"
import { SquadIndex, SquadRecord, UnitSquadIndex } from "../Squad/Model"
import { UnitIndex } from "../Unit/Model"

export type CombatCreateParams = {
    left: SquadRecord
    right: SquadRecord
    squads: SquadIndex
    units: UnitIndex
}

export type CombatBoardState = {
    currentTurn: number
    scene: Phaser.Scene
    left: string
    squadIndex: SquadIndex
    unitIndex: UnitIndex
    unitSquadIndex: UnitSquadIndex
    charaIndex: CharaIndex
}
