import { CharaIndex } from "../Chara/Model"
import { SquadIndex, UnitSquadIndex } from "../Squad/Model"
import { UnitIndex } from "../Unit/Model"

export type CombatCreateParams = {
    left: string // TODO: change to Squad
    right: string
    squads: SquadIndex
    units: UnitIndex
    onCombatFinish: () => void
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
