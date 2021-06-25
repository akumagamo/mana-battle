import map from "../maps/green_harbor";
import { sceneMock } from "../test/mocks";
import create from "./create";

jest.mock("../Squad/ListSquadsScene/ListSquadsScene");
jest.mock("../UI/announcement");
jest.mock("../Combat/CombatScene");

const map_ = map();

it("runs", () => {
  create(sceneMock(), map_);
});
