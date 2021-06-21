import { containerMock, getMockCalls, sceneMock } from "../../../test/mocks";
import { initialState } from "../Model";
import * as newGameButtonClicked from "./newGameButtonClicked_";
import * as start from "../../../CharaCreation/start";

jest.mock("../../../UI/Transition");
jest.mock("../../../CharaCreation/start", () => jest.fn());

it("Should start the chara creation screen", async () => {
  const scene = sceneMock();
  await newGameButtonClicked.handleNewGameButtonClicked({
    scene,
    state: { ...initialState, container: containerMock() },
  });

  expect(getMockCalls(start).length).toBe(1);
});
