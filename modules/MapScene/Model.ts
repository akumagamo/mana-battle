import { Map } from "immutable"

export type Environment = {
    scene: Phaser.Scene
    state: MapSceneState
}

type Identifier<A> = Map<A, string>

type SquadId = Identifier<"squad">
type CityId = Identifier<"city">
type ForceId = Identifier<"force">
type UnitId = Identifier<"unit">

export type SquadIndex = Map<SquadId, Squad>
type CityIndex = Map<CityId, City>

export type Squad = {
    id: SquadId
    force: ForceId
    x: number
    y: number
}

export const createSquad = (
    x: number,
    y: number,
    force: string,
    id: string
): Squad => ({
    id: createSquadId(id),
    force: createForceId(force),
    x,
    y,
})

type City = {
    id: CityId
    name: string
    x: number
    y: number
}

export const createSquadId = (id: string): SquadId =>
    Map({
        squad: id,
    }) as Map<"squad", string>

export const createCityId = (id: string): CityId =>
    Map({
        city: id,
    }) as Map<"city", string>

export const createForceId = (id: string): ForceId =>
    Map({
        force: id,
    }) as Map<"force", string>
export const createUnitId = (id: string): UnitId =>
    Map({
        unit: id,
    }) as Map<"unit", string>

export const setState = (scene: Phaser.Scene, s: MapSceneState) =>
    scene.data.set("_state", s)
export const getState = (scene: Phaser.Scene) =>
    scene.data.get("_state") as MapSceneState

export type MapSceneState = {
    squads: SquadIndex
    cities: CityIndex
}

export type MapScreenProperties = {
    squads: {
        x: number
        y: number
        id: string
        force: string
    }[]
    cities: { x: number; y: number; id: string; force: string }[]
}

export const createMapScreenProperties = (
    squads: [number, number, string][],
    cities: [number, number, string][]
): MapScreenProperties => ({
    squads: squads.map(([x, y, force], index) => ({
        x,
        y,
        force,
        id: index.toString(),
    })),
    cities: cities.map(([x, y, force], index) => ({
        x,
        y,
        force,
        id: index.toString(),
    })),
})

export const createInitialState = (scene: Phaser.Scene, data:MapScreenProperties) => {

    const state = {
        cities: Map() as CityIndex,
        squads: data.squads.reduce(
            (xs, x) =>
                xs.set(createSquadId(x.id), {
                    ...x,
                    id: createSquadId(x.id),
                    force: createForceId(x.force),
                }),
            Map() as SquadIndex
        ),
    }
    setState(scene, state)
}

export const setSceneParameters = (
    scene: Phaser.Scene,
    params: MapScreenProperties
) => scene.game.registry.set("Map Screen Data", params)

export const getSceneParameters = (scene: Phaser.Scene) => {
    const data: MapScreenProperties = scene.game.registry.get(
        "Map Screen Data"
    ) || { squads: [], cities: [] }
    return data
}

export const getPlayerSquads = (state: MapSceneState) =>
    state.squads.filter((sqd) => sqd.force.equals(createForceId("PLAYER")))
export const getEnemySquads = (state: MapSceneState) =>
    state.squads.filter((sqd) => sqd.force.equals(createForceId("CPU")))
