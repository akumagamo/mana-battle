import { SCREEN_WIDTH } from "../../constants"
import { Container } from "../../Models"
import text from "../../UI/text"
import { getCity, getForce, MapState } from "../Model"

export default async (
    state: MapState,
    uiContainer: Container,
    baseY: number,
    id: string
): Promise<void> => {
    const city = getCity(state, id)

    text(20, baseY, city.name, uiContainer)

    if (city.force) {
        const force = getForce(state, city.force)
        if (force) {
            text(SCREEN_WIDTH - 300, baseY - 20, `Controlled by`, uiContainer)
            text(SCREEN_WIDTH - 300, baseY + 10, force.name, uiContainer)
        }
    }
}
