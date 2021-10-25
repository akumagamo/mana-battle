import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../_shared/constants"

export default function(scene: Phaser.Scene) {
    const github = scene.add.image(0, 0, "github")
    github.setDisplaySize(64, 64)

    github.setPosition(SCREEN_WIDTH - 64 + 20, SCREEN_HEIGHT - 64 - 20)
    github.setInteractive().on("pointerdown", () => {
        window.location.href = "https://github.com/lfarroco/mana-phaser"
    })
}
