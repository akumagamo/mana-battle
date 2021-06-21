import { getMockCalls, sceneMock } from "../../test/mocks";
import { create } from "./create";
import * as newGameButtonClicked from "./events/newGameButtonClicked";
import * as optionsButtonClicked from "./events/optionsButtonClicked";
import { initialState } from "./Model";

jest.mock("../storyManager", () => jest.fn());
jest.mock("../../CharaCreation/CharaCreationScene", () => jest.fn());

it("Should have run without breaking", () => {
  const scene = sceneMock();
  create(scene, initialState);
});

it("Should subscribe to the action that creates a new game", () => {
  const scene = sceneMock();
  create(scene, initialState);

  hasSubscribed(scene, newGameButtonClicked.key);
});

it("Should subscribe to the action that opens an option screen", () => {
  const scene = sceneMock();
  create(scene, initialState);

  hasSubscribed(scene, optionsButtonClicked.key);
});

function hasSubscribed(scene: Phaser.Scene, eventName: string) {
  const subscribed = getMockCalls(scene.events.once).some(
    ([key]: string[]) => key === eventName
  );

  expect(subscribed).toBe(true);
}
