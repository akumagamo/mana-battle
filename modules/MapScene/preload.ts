import { PUBLIC_URL } from "../_shared/constants"

export default (scene: Phaser.Scene) => {
    ;["pipo"].forEach((str) =>
        scene.load.image(str, PUBLIC_URL + "/tileset/" + str + ".png")
    )
    ;["maps/map"].forEach((str) =>
        scene.load.tilemapTiledJSON(str, PUBLIC_URL + "/" + str + ".json")
    )

    const jobs = ["soldier", "skeleton"]
    jobs.forEach((job) => {
        const mapSpriteKey = `${job}-map`
        scene.load.spritesheet(
            mapSpriteKey,
            `${PUBLIC_URL}/jobs/${job}/map-animations.png`,
            { frameWidth: 32, frameHeight: 32, endFrame: 11 }
        )
    })

    scene.load.image("chara_cursor", PUBLIC_URL + "/chara/chara_cursor.svg")
}
