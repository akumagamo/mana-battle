import { Map, Set } from "immutable"

export type Environment = {
    scene: Phaser.Scene
    state: MapSceneState
}

type Identifier<A> = Map<A, string>

type SquadId = Identifier<"squad">
type CityId = Identifier<"city">
type ForceId = Identifier<"force">
type UnitId = Identifier<"unit">

type SquadIndex = Map<SquadId, Squad>
type UnitIndex = Map<UnitId, Unit>
type CityIndex = Map<CityId, City>

export type Squad = {
    id: SquadId
    force: ForceId
    dispatched: boolean
    x: number
    y: number
}

type City = {
    id: CityId
    name: string
    x: number
    y: number
}
type Unit = {
    id: UnitId
    name: string
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
    units: UnitIndex
}

type MapScreenProperties = {
    squads: {
        x: number
        y: number
        id: string
        force: string
        dispatched: boolean
        units: { x: number; y: number; id: string }[]
    }[]
    cities: { x: number; y: number; id: string; force: string }[]
    units: {
        x?: number
        y?: number
        squad?: string
        id: string
        name: string
        force: string
    }[]
}

export const createInitialState = (scene: Phaser.Scene) => {
    const data: MapScreenProperties = scene.game.registry.get(
        "Map Screen Data"
    ) || { squads: [], cities: [], units: [] }

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
        units: data.units.reduce(
            (xs, x) =>
                xs.set(createUnitId(x.id), { ...x, id: createUnitId(x.id) }),
            Map() as UnitIndex
        ),
    }
    setState(scene, state)
}

export const getPlayerSquads = (state: MapSceneState) =>
    state.squads.filter((sqd) => sqd.force.equals(createForceId("PLAYER")))
export const getEnemySquads = (state: MapSceneState) =>
    state.squads.filter((sqd) => sqd.force.equals(createForceId("CPU")))
export const getSquadUnits = (state: MapSceneState, id: SquadId) =>
    state.units.filter((unit) => id.equals(unit.id))
