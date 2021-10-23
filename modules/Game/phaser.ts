import Phaser from "phaser"
import { listen, startScene } from "./app"
import events from "events"
import TitleScene from "../TitleScene/phaser"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../_shared/constants"

const eventEmitter = new events.EventEmitter()

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
    parent: "content",
}

export const main = () => {
    const game = new Phaser.Game(config)
    game.scale.lockOrientation(Phaser.Scale.PORTRAIT)

    listen(eventEmitter)

    // TODO: use a core scene to load shared assets
    game.scene.add(TitleScene.key, TitleScene)

    startScene(TitleScene.key, id => {
        game.scene.start(id)
    })

    if (process.env.NODE_ENV === "development") {
        // @ts-ignore
        window.game = game
    }
}
