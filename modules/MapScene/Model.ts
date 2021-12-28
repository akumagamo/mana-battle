export type MapScreen = {
    scene: Phaser.Scene
    tilemap: Phaser.Tilemaps.TilemapLayer
}

export const MapScreen = (manager: Phaser.Scenes.SceneManager) => {
    const scene = manager.getScene("Map Screen")
    return {
        ...scene,
        getSprite: (name: string) =>
            scene.children.getByName(
                name
            ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        tilemap: () =>
            scene.children.getByName("bg") as Phaser.Tilemaps.TilemapLayer,
    }
}
