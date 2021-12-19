import { Map } from "immutable"

export type Entity = {
    id: string
}

export type Collection<A> = Map<string, Entity & A>

export const createCollection = <A>(entities: (Entity & A)[]): Collection<A> =>
    entities.reduce((xs, x) => xs.set(x.id, x), Map() as Collection<A>)
