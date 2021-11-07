export type Environment = {
    scene: Phaser.Scene
    state: MapSceneState
}

type Identifier<A> = { _identifierOf: A; value: string }

type SquadId = Identifier<"squad">
type CityId = Identifier<"city">

export const createSquadId = (id: string): SquadId => ({
    _identifierOf: "squad",
    value: id,
})
export const createCityId = (id: string): CityId => ({
    _identifierOf: "city",
    value: id,
})

export const setState = (scene: Phaser.Scene, s: MapSceneState) =>
    scene.data.set("_state", s)
export const getState = (scene: Phaser.Scene) =>
    scene.data.get("_state") as MapSceneState

export type MapSceneState = {
    dispatchedSquads: SquadId[]
    cities: CityId[]
    playerSquads: SquadId[]
    enemySquads: SquadId[]
}
const initialState: MapSceneState = {
    dispatchedSquads: [],
    cities: [],
    playerSquads: [],
    enemySquads: [],
}

export const createInitialState = (scene: Phaser.Scene) => {
    setState(scene, initialState)
}
