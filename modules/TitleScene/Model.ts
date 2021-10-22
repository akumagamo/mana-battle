export type Environment = {
    scene: Phaser.Scene
    state: TitleSceneState
}

export type TitleSceneState = {
    music: Phaser.Sound.BaseSound | null
    container: Phaser.GameObjects.Container | null
}
export const initialState: TitleSceneState = {
    music: null,
    container: null,
}
