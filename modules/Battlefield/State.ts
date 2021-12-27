import { Map } from "immutable"
import { Collection } from "../_shared/Entity"
import { Force, ForceId, Relationships, Relationship } from "./Force"
import { City } from "./City"
import {
    runFallible,
    validateProperties,
    selectNullable,
} from "../_shared/Fallible"

export type State = {
    forces: Collection<Force>
    cities: Collection<City>
}

export const emptyState = {
    forces: Map() as Collection<Force>,
    cities: Map() as Collection<City>,
}

export const addForce = (force: Force) => (state: State) => ({
    ...state,
    forces: state.forces
        .map((f) => ({
            ...f,
            relations: f.relations.set(f.id, Relationships.NEUTRAL),
        }))
        .set(force.id, {
            ...force,
            relations: force.relations.merge(
                state.forces
                    .map(() => Relationships.NEUTRAL)
                    .mapKeys((k) => ForceId(k))
            ),
        }),
})

export const addCity = (city: City) => (state: State) => ({
    ...state,
    cities: state.cities.set(city.id, city),
})

export const updateRelationship = (
    state: State,
    sourceId: ForceId,
    targetId: ForceId,
    relation: Relationship
) => {
    const sel = {
        source: selectNullable(
            `Source should exist (provided ${sourceId})`,
            state.forces.get(sourceId, null)
        ),
        target: selectNullable(
            `Target should exist (provided ${targetId})`,
            state.forces.get(targetId, null)
        ),
    }

    const args = validateProperties<{ source: Force; target: Force }>(sel)

    return runFallible(args, [], ({ source, target }) => {
        return {
            ...state,
            forces: state.forces.set(target.id, {
                ...target,
                relations: target.relations.set(source.id, relation),
            }),
        }
    })
}
