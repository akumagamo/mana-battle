import { createForce } from "./Force"

test("should generate a force if provided with valid parameters", () => {
    const force = createForce("test")

    expect(force).not.toBeNull()
})
