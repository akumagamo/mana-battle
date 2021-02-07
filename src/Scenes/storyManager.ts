import { PLAYER_FORCE } from "../constants";
import { fadeOut } from "../UI/Transition";
import { Set } from "immutable";
import { startTheaterScene } from "../Theater/TheaterScene";
import { startCharaCreationScene } from "../CharaCreation/CharaCreationScene";
import chapter_1_intro from "../Theater/Chapters/chapter_1_intro";
import { MapCommands } from "../Map/MapCommands";
import maps from "../maps";
import { startMapScene } from "../Map/MapScene";
import { makeSquad, updateMember } from "../Squad/Model";
import { toMapSquad } from "../Unit/Model";
import TitleScene from "./TitleScene";
import { makeUnit } from "../Unit/makeUnit";

export const storyManager = async (parent: TitleScene) => {
  parent.tweens.add({
    targets: parent.music,
    volume: 0,
    duration: 1000,
  });
  await fadeOut(parent);

  parent.container.destroy();
  const scene = await startCharaCreationScene(parent);

  const unit = await scene.createUnitForm();
  console.log(`unit`, unit);
  // const answers = await startTheaterScene(parent, chapter_1_intro(unit));
  // console.log(`answers`, answers);

  const firstSquad = updateMember(makeSquad("1", PLAYER_FORCE), {
    id: unit.id,
    x: 2,
    y: 2,
    leader: true,
  });

  const members = [
    makeUnit("fighter", "m1", 1),
    makeUnit("fighter", "m2", 1),
    makeUnit("archer", "m3", 1),
    makeUnit("mage", "m4", 1),
  ];

  const alliedUnits = {
    [unit.id]: unit,
    ...members.reduce((xs, x) => ({ ...xs, [x.id]: x }), {}),
  };

  const sqd = {
    ...firstSquad,
    members: {
      ...firstSquad.members,
      m1: { id: members[0].id, leader: false, x: 3, y: 1 },
      m2: { id: members[1].id, leader: false, x: 3, y: 3 },
      m3: { id: members[2].id, leader: false, x: 1, y: 1 },
      m4: { id: members[3].id, leader: false, x: 1, y: 3 },
    },
  };

  const squads = [sqd];

  const map = maps[0]();
  let commands: MapCommands[] = [
    {
      type: "UPDATE_STATE",
      target: {
        ...map,
        dispatchedSquads: Set(["1"].concat(map.squads.map((u) => u.id))),
        squads: map.squads.concat(
          squads.map((s) =>
            toMapSquad(
              s,
              map.cities.find((c) => c.id === "castle1")
            )
          )
        ),

        units: map.units.merge(alliedUnits),
      },
    },
  ];

  const outcome = await startMapScene(parent, commands);
  console.log(outcome);
};
