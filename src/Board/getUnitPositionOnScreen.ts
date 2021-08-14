import { MemberRecord } from "../Squad/Model"
import { cartesianToIsometric } from "../utils/isometric"

export default (squadMember: MemberRecord) => {
    const { x, y } = cartesianToIsometric(squadMember.x - 1, squadMember.y - 1)

    return { x, y: y }
}
