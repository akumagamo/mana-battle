import "regenerator-runtime/runtime"
import {SCREEN_HEIGHT, SCREEN_WIDTH} from "./modules/_shared/constants"

jest.setTimeout(20000)

page.setViewport({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT })
