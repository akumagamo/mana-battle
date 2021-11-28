import { Map } from "immutable"

const SCREEN_KEY = "Map Screen"
const PARAMS_KEY = "Map Screen Data"
const STATE_KEY = "_state"
const PLAYER_ID = "PLAYER"
const CPU_ID = "CPU"

export type Environment = {
    scene: Phaser.Scene
    state: MapSceneState
}

type Identifier<A> = Map<A, string>

type SquadId = Identifier<"squad">
type CityId = Identifier<"city">
type ForceId = Identifier<"force">

export type SquadIndex = Map<SquadId, Squad>
export type CityIndex = Map<CityId, City>

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

export const getSquad = (id: string) => (state: MapSceneState) => {
    const squad = state.squads.find((squad) =>
        squad.id.equals(createSquadId(id))
    )
    if (!squad) throw new Error(`Invalid squad id supplied: ${id} `)
    return squad
}

export const isAllied = (squad: Squad) => squad.force.get("force") === "PLAYER"
export const isEnemy = (squad: Squad) => squad.force.get("force") === "CPU"

export type City = {
    id: CityId
    name: string
    force: ForceId
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

export const setState = (
    scene: Phaser.Scene,
    fn: (s: MapSceneState) => MapSceneState
) => {
    const state = scene.data.get(STATE_KEY)

    const updatedState = fn(state)

    scene.data.set(STATE_KEY, updatedState)
}
export const getState = (scene: Phaser.Scene) =>
    scene.scene.get(SCREEN_KEY).data.get(STATE_KEY) as MapSceneState

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
    cities: { name: string; x: number; y: number; id: string; force: string }[]
}

export const createMapScreenProperties = ({
    squads,
    cities,
}: {
    squads: [number, number, "PLAYER" | "CPU"][]
    cities: [number, number, "PLAYER" | "CPU" | "NEUTRAL"][]
}): MapScreenProperties => ({
    squads: squads.map(([x, y, force], index) => ({
        x,
        y,
        force,
        id: index.toString(),
    })),
    cities: cities.map(([x, y, force], index) => ({
        name: `City ${index + 1}`,
        x,
        y,
        force,
        id: index.toString(),
    })),
})

export const createInitialState = (data: MapScreenProperties) => {
    const state = {
        cities: data.cities.reduce(
            (xs, x) =>
                xs.set(createCityId(x.id), {
                    ...x,
                    id: createCityId(x.id),
                    force: createForceId(x.force),
                }),
            Map() as CityIndex
        ),
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
    return state
}

export const setSceneParameters = (
    scene: Phaser.Scene,
    params: MapScreenProperties
) => scene.game.registry.set(PARAMS_KEY, params)

export const getSceneParameters = (scene: Phaser.Scene) => {
    const data: MapScreenProperties = scene.game.registry.get(PARAMS_KEY) || {
        squads: [],
        cities: [],
    }
    return data
}

export const getPlayerSquads = (state: MapSceneState) =>
    state.squads.filter((sqd) => sqd.force.equals(createForceId(PLAYER_ID)))
export const getEnemySquads = (state: MapSceneState) =>
    state.squads.filter((sqd) => sqd.force.equals(createForceId(CPU_ID)))
