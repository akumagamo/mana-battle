import { Map } from "immutable"
import { Collection } from "../_shared/Entity"
import { Force, ForceId, Relationships, Relationship } from "./Force"
import { City } from "./City"

export type State = {
    forces: Collection<Force>
    cities: Collection<City>
}

export const emptyState = {
    forces: Map() as Collection<Force>,
    cities: Map() as Collection<City>,
}

export const addForce = (state: State, force: Force) => ({
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

export const addCity = (state: State, city: City) => ({
    ...state,
    cities: state.cities.set(city.id, city),
})



export const updateRelationship = (
    state: State,
    source: ForceId,
    target: ForceId,
    relation: Relationship
): [string[], State] => {
    const source_ = state.forces.get(source)
    const target_ = state.forces.get(target)

    const missingSource = !source_ ? [`Invalid source id (${source})`] : []

    const missingTarget = !target_ ? [`Invalid target id (${target})`] : []

    const errors = [...missingSource, ...missingTarget]

    return [
        errors,
        source_ && target_
            ? {
                  ...state,
                  forces: state.forces.set(target, {
                      ...target_,
                      relations: target_.relations.set(source_.id, relation),
                  }),
              }
            : state,
    ]
}
