import { TitleSceneState } from "./Model"

export function changeMusic(
    scene: Phaser.Scene,
    state: TitleSceneState,
    key: string
) {
    if (!process.env.SOUND_ENABLED) return

    if (state.music) state.music.destroy()

    //    if (getOptions().musicEnabled) {
    state.music = scene.sound.add(key)

    //@ts-ignore
    state.music.setVolume(0.1)
    state.music.play()
    //   }
}
