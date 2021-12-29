import "regenerator-runtime/runtime"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./modules/_shared/constants"

jest.setTimeout(process.env.CI ? 20000 : 5000)

page.setViewport({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT })
