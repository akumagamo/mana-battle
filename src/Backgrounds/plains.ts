import grass from "../Props/grass"
import branch from "../Props/branch"
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants"
import { Container } from "../Models"

export default (scene: Phaser.Scene, container: Container) => {
    const bg = scene.add.image(0, 0, "backgrounds/plain")
    container.add(bg)

    bg.setOrigin(0, 0)
    bg.displayWidth = SCREEN_WIDTH
    bg.displayHeight = SCREEN_HEIGHT

    const coords = [
        { x: 350, y: 40 },
        { x: 320, y: 60 },

        { x: 460, y: 70 },
        { x: 420, y: 80 },

        { x: 550, y: 110 },
        { x: 590, y: 120 },

        { x: 680, y: 120 },
        { x: 1110, y: 350 },
        { x: 1130, y: 370 },
    ]
    coords.map(grass(scene)).forEach(g => container.add(g))

    const bushes = [
        { x: 320, y: 700 },
        { x: 390, y: 710 },
        { x: 450, y: 750 },
        { x: 1250, y: 450 },
        { x: 50, y: 410 },
    ]

    bushes.forEach(({ x, y }) => {
        const bush = scene.add.image(x, y, "props/bush")

        container.add(bush)
        bush.setScale(1)
        bush.setOrigin(0.5, 1)

        scene.tweens.add({
            targets: bush,
            scaleX: 1.25,
            duration: 2000 * Math.random() + 10000,
            repeat: -1,
            yoyo: true,
            ease: "Linear",
        })
    })

    const farTree1 = scene.add.image(870, 130, "props/far_tree_1")

    container.add(farTree1)

    farTree1.setScale(0.5)
    farTree1.setOrigin(0.5, 1)
    scene.tweens.add({
        targets: farTree1,
        scaleX: 0.55,
        rotation: -0.2,
        duration: 1200 * Math.random() + 4000,
        repeat: -1,
        yoyo: true,
        ease: "Linear",
    })

    const br = branch(scene)(1000, 250, 0.4)

    container.add(br)
}
