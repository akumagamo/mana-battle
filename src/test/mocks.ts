import { Container } from "../Models"

export const eventsMock = () => ({
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
})
export const gameObjectMock = () => ({
    ...eventsMock(),
    toggleFlipX: jest.fn(),
    setDepth: jest.fn(),
    setSize: jest.fn(),
    setScale: jest.fn(),
    sendToBack: jest.fn(),
    bringToTop: jest.fn(),
    destroy: jest.fn(),
    setOrigin: jest.fn(),
    setInteractive: jest.fn(),
    setPosition: jest.fn(),
    setAlpha: jest.fn(),
    setName: jest.fn(),
    scene: sceneMock(),
    getBounds: () => ({ width: 111, height: 111 }),
})
export const containerMock = jest.fn(
    (x = 0, y = 0): Container =>
        (({
            x,
            y,
            add: jest.fn(),
            removeAll: jest.fn(),
            ...gameObjectMock(),
            __type__: "container",
        } as unknown) as Container)
)

export const imageMock = jest.fn(() => ({
    setTint: jest.fn(),
    ...gameObjectMock(),
    __type__: "image",
}))
export const spriteMock = jest.fn(() => ({
    ...gameObjectMock(),
    setTint: jest.fn(),
    play: jest.fn(),
    __type__: "sprite",
}))

export const textMock = jest.fn(() => ({
    setShadow: jest.fn(),
    setColor: jest.fn(),
    getTextMetrics: jest.fn(),
    ...gameObjectMock(),
    __type__: "text",
}))
export const graphicsMock = jest.fn(() => ({
    ...gameObjectMock(),
    lineStyle: jest.fn(),
    fillGradientStyle: jest.fn(),
    strokeRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRectShape: jest.fn(),
    fillRectShape: jest.fn(),
    __type__: "graphics",
}))
export const tweensMock = {
    add: jest.fn(),
    killAll: jest.fn(),
    killTweensOf: jest.fn(),
}

export const sceneMock = (): Phaser.Scene => {
    return ({
        __type__: "scene",
        add: {
            container: containerMock,
            image: imageMock,
            sprite: spriteMock,
            text: textMock,
            graphics: graphicsMock,
            rectangle: graphicsMock,
            zone: containerMock,
            tween: jest.fn(({ onComplete }) => {
                if (onComplete) onComplete()
            }),
            dom: jest.fn(() => ({
                createFromCache: jest.fn(() => ({
                    setPerspective: jest.fn(),
                    setOrigin: jest.fn(),
                })),
            })),
        },
        tweens: tweensMock,
        events: eventsMock(),
        cameras: {
            main: {
                fadeIn: jest.fn().mockResolvedValue(null),
                fadeOut: jest.fn().mockResolvedValue(null),
            },
        },
        anims: {
            create: jest.fn(),
            generateFrameNumbers: jest.fn(),
            exists: jest.fn(),
        },
        time: {
            addEvent: jest.fn().mockResolvedValue(null),
        },
        game: {
            events: { ...eventsMock() },
        },
        input: {
            setDraggable: jest.fn(),
            mouse: { disableContextMenu: jest.fn() },
            ...eventsMock(),
        },
        scene: {
            scene: {
                manager: jest.fn(),
            },
        },
        preload: jest.fn(),
        create: jest.fn(),
    } as unknown) as Phaser.Scene
}

export const getMockCalls = (a: any) => {
    return a.mock.calls
}
