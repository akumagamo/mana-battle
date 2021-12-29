import { main as Battlefield } from "../Battlefield/main"

export type ScreenController = {
    screens: {
        battlefield: {
            start: () => void
        }
    }
    removeAll: () => void
}

export default (manager: Phaser.Scenes.SceneManager): ScreenController => ({
    screens: {
        battlefield: {
            start: () => {
                Battlefield(manager).start()
            },
        },
    },
    removeAll: () => {
        const keys = manager.scenes.map((scn) => scn.scene.key)
        keys.forEach((k) => {
            if (k !== "Core") {
                manager.remove(k)
            }
        })
    },
})
