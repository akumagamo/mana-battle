import Phaser from "phaser"
import { MapScreenProperties } from "../../MapScene/Model"
import TitleScene from "../../TitleScene/phaser"
import MapScene from "../../MapScene/phaser"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../_shared/constants"
import preload from "../preload"

declare global {
    interface Window {
        game: Phaser.Game
    }
}

const Core = {
    key: "Core",
    preload: function (this: Phaser.Scene) {
        preload(this)
    },
    create: function (this: Phaser.Scene) {
        this.game.events.on("Start Title Screen", () => {
            this.game.scene.add(TitleScene.key, TitleScene, true)
        })

        this.game.events.on(
            "Start Map Screen",
            (params: MapScreenProperties) => {
                this.game.scene.add(MapScene.key, MapScene, true, params)
            }
        )

        const isNotHeadless = navigator.languages.length > 1
        if (isNotHeadless) {
            this.game.events.emit("Start Title Screen")
        }

        this.game.events.emit("Core Screen Created")
    },
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#000000",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    scene: Core,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
        createContainer: true,
    },
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
        window.game = game
    }
}
