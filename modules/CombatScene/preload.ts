import { PUBLIC_URL } from "../_shared/constants"

export default (scene: Phaser.Scene) => {
    loadBackground(scene)

    const jobs = ["soldier"]
    loadUnits(jobs, scene)

    loadSkills(scene)
}

function loadSkills(scene: Phaser.Scene) {
    scene.load.spritesheet("fire", `${PUBLIC_URL}/fire.svg`, {
        frameWidth: 50,
        frameHeight: 117,
        endFrame: 6,
    })
}

function loadUnits(jobs: string[], scene: Phaser.Scene) {
    jobs.forEach((job) => {
        scene.load.json(`${job}-data`, `${PUBLIC_URL}/jobs/${job}/data.json`)
        scene.load.atlas(
            `${job}_atlas`,
            `assets/jobs/${job}/animations.png`,
            `assets/jobs/${job}/animations.json`
        )
    })
}

function loadBackground(scene: Phaser.Scene) {
    ;["backgrounds/plain"].forEach((str) =>
        scene.load.image(str, PUBLIC_URL + "/" + str + ".png")
    )
}
