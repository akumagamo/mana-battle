import "regenerator-runtime/runtime"
import {waitForSceneCreation} from "./specifications/dsl"

jest.setTimeout(30000)

const port = process.env.CI ? 3333 : 3000

beforeAll(async () => {
    await page.goto(`http://localhost:${port}`)
    await waitForSceneCreation(page, "Core Screen")
})
