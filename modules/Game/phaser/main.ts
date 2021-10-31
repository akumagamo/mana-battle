import Phaser from "phaser"
import TitleScene from "../../TitleScene/phaser"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../_shared/constants"

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#000000",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
        createContainer: true,
    },
    scene: TitleScene,
    parent: "content",
    physics: {
        default: "arcade",
        arcade: {
            debug: process.env.NODE_ENV === "development",
        },
    },
}

export const main = () => {
    const game = new Phaser.Game(config)
    game.scale.lockOrientation(Phaser.Scale.PORTRAIT)
    if (process.env.NODE_ENV === "development") {
        // @ts-ignore
        window.game = game
    }
}
