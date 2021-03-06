import { City } from "../Battlefield/City"

const CITY_WIDTH = 40
const CITY_HEIGHT = 40
const CITY_COLOR = 0x33aa88
const CITY_TEXTURE = "button"

export const createCity = (scene: Phaser.Scene) => (city: City) => {
    const {
        position: { x, y },
        id,
    } = city
    const sprite = scene.physics.add
        .image(x, y, CITY_TEXTURE)
        .setTint(CITY_COLOR)
        .setSize(CITY_WIDTH, CITY_HEIGHT)
        .setDisplaySize(CITY_WIDTH, CITY_HEIGHT)
        .setName(`city-${id}`)

    return sprite
}
