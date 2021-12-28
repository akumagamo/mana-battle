export default function (mapScreen: Phaser.Scene) {
    return () => {
        mapScreen.physics.pause()
    }
}
