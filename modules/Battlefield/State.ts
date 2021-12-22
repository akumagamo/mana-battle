import { Map } from "immutable"
import { Collection } from "../_shared/Entity"
import { Force } from "./Force"

export type State = {
    forces: Collection<Force>
}

export const emptyState = {
    forces: Map() as Collection<Force>,
}
