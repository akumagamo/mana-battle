import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants"
import { Image, Pointer } from "../Models"
import { delay } from "../Scenes/utils"
import { disableCellClick, enableCellClick } from "./board/input"
import { cellSize } from "./config"
import { MapState } from "./Model"

export function setWorldBounds(state: MapState) {
    const rows = state.cells[0].length
    const cols = state.cells.length
    state.bounds = {
        x: { min: -1 * (rows * cellSize - SCREEN_WIDTH), max: 0 },
        y: { min: -1 * (cols * cellSize - SCREEN_HEIGHT), max: 0 },
    }
}

export function makeWorldDraggable(scene: Phaser.Scene, state: MapState) {
    state.mapContainer.setSize(
        state.mapContainer.getBounds().width,
        state.mapContainer.getBounds().height
    )

    state.mapContainer.setInteractive()
    scene.input.setDraggable(state.mapContainer)

    scene.input.on(
        "drag",
        (
            pointer: Pointer,
            _gameObject: Image,
            _dragX: number,
            _dragY: number
        ) => {
            if (state.dragDisabled) return

            if (!state.isDragging) state.isDragging = true

            const delta = {
                x: pointer.prevPosition.x - pointer.x,
                y: pointer.prevPosition.y - pointer.y,
            }

            const next = {
                x: scene.cameras.main.scrollX + delta.x,
                y: scene.cameras.main.scrollY + delta.y,
            }

            console.log(next)

            if (
                next.x < 2000 &&
                next.x > -2000 &&
                next.y < 2000 &&
                next.y > -2000
            ) {
                scene.cameras.main.setScroll(next.x, next.y)
            }
            //else {
            //     // Movement bound to one or two corners
            //     const gx =
            //         mx > x.max ? x.max : mx < x.min ? x.min : state.mapX - dx
            //     const gy =
            //         my > y.max ? y.max : my < y.min ? y.min : state.mapY - dy

            //     state.mapContainer.setPosition(gx, gy)
            // }
        }
    )

    scene.input.on("dragend", async (pointer: Pointer) => {
        const timeDelta = pointer.upTime - pointer.downTime
        const posDelta = Math.abs(pointer.deltaX) + Math.abs(pointer.deltaY)
        const minTimeDelta = 300
        const minPosDelta = 30

        state.mapX = state.mapContainer.x
        state.mapY = state.mapContainer.y
        // Avoid firing "click_cell" event on dragend if drag was too
        // small or brief

        if (
            state.isDragging &&
            (timeDelta > minTimeDelta || posDelta > minPosDelta)
        ) {
            disableCellClick(state)
            await delay(scene, 20)
            enableCellClick(state)
        }
        state.isDragging = false
    })
}
