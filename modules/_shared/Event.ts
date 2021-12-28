// export default <ARGS>(key: string) =>
//     (listener: (a: ARGS) => (scene: Phaser.Scene) => void) =>
//     (scene: Phaser.Scene) => {
//         const handler = (args: ARGS) => {
//             listener(args)(scene)
//         }
//         return {
//             key,
//             listen: () => {
//                 scene.events.on(key, handler)
//             },
//             emit: (args: ARGS) => {
//                 scene.events.emit(key, args)
//             },
//             off: () => {
//                 scene.events.off(key, handler)
//             },
//         }
//     }
export const listener =
    (scene: Phaser.Scene) =>
    <A>(handler: (a: A) => void) => {
        scene.events.on(handler.name, handler)
    }
export const emitter =
    (scene: Phaser.Scene) =>
    <A>(handler: (a: A) => void) =>
    (args: A) => {
        scene.events.emit(handler.name, args)
    }
