import { PLAYER_FORCE } from "../constants";
import { fadeOut } from "../UI/Transition";
import { List, Map, Set } from "immutable";
import { startCharaCreationScene } from "../CharaCreation/CharaCreationScene";
import { MapCommands } from "../Map/MapCommands";
import maps from "../maps";
import { startMapScene } from "../Map/MapScene";
import { makeSquad, makeMember, squadBuilder } from "../Squad/Model";
import { toMapSquad } from "../Unit/Model";
import TitleScene from "./TitleScene";
import { makeUnit } from "../Unit/makeUnit";
import { startTheaterScene } from "../Theater/TheaterScene";
import chapter_1_intro from "../Theater/Chapters/chapter_1_intro";

const GAME_SPEED = parseInt(process.env.SPEED);
export const storyManager = async (parent: TitleScene) => {
  if (process.env.SOUND_ENABLED) {
    parent.tweens.add({
      targets: parent.music,
      volume: 0,
      duration: 1000,
    });
  }

  await fadeOut(parent, 1000 / GAME_SPEED);
  parent.turnOff()

  const scene = await startCharaCreationScene(parent);

  const unit = await scene.createUnitForm();
  // const answers = await startTheaterScene(parent, chapter_1_intro(unit));
  // console.log(`answers`, answers);

  const firstSquad = makeSquad({
    id: "1",
    force: PLAYER_FORCE,
    members: Map({
      [unit.id]: makeMember({
        id: unit.id,
        x: 2,
        y: 2,
      }),
    }),
    leader: unit.id,
  });

  const alliedUnits = Map({
    [unit.id]: { ...unit, squad: "1" },
    m1: { ...makeUnit("fighter", "m1", 1), squad: "1" },
    m2: { ...makeUnit("fighter", "m2", 1), squad: "1" },
    m3: { ...makeUnit("archer", "m3", 1), squad: "1" },
    m4: { ...makeUnit("mage", "m4", 1), squad: "1" },

    c1: { ...makeUnit("fighter", "c1", 1), squad: "c" },
    c2: { ...makeUnit("fighter", "c2", 1), squad: "c" },
    c3: { ...makeUnit("fighter", "c3", 1), squad: "c" },
    c4: { ...makeUnit("fighter", "c4", 1), squad: "c" },
    c5: { ...makeUnit("fighter", "c5", 1), squad: "c" },
    d1: { ...makeUnit("fighter", "d1", 1), squad: "d" },
    d2: { ...makeUnit("fighter", "d2", 1), squad: "d" },
    d3: { ...makeUnit("fighter", "d3", 1), squad: "d" },
    d4: { ...makeUnit("fighter", "d4", 1), squad: "d" },
    d5: { ...makeUnit("fighter", "d5", 1), squad: "d" },
  });

  const sqd = firstSquad.mergeDeep(
    Map({
      members: Map({
        m1: makeMember({ id: "m1", x: 3, y: 1 }),
        m2: makeMember({ id: "m2", x: 3, y: 3 }),
        m3: makeMember({ id: "m3", x: 1, y: 1 }),
        m4: makeMember({ id: "m4", x: 1, y: 3 }),
      }),
    })
  );

  const sqd2 = squadBuilder({
    id: "c",
    force: PLAYER_FORCE,
    leader: "c1",
    members: [
      ["c1", 3, 2],
      ["c2", 3, 1],
      ["c3", 3, 3],
      ["c4", 1, 1],
      ["c5", 1, 3],
    ],
  });
  const sqd3 = squadBuilder({
    id: "d",
    force: PLAYER_FORCE,
    leader: "d1",
    members: [
      ["d1", 3, 2],
      ["d2", 3, 1],
      ["d3", 3, 3],
      ["d4", 1, 1],
      ["d5", 1, 3],
    ],
  });

  const squads = [sqd, sqd2, sqd3];

  const map = maps[0]();
  let commands: MapCommands[] = [
    {
      type: "UPDATE_STATE",
      target: {
        ...map,
        dispatchedSquads: Set(List(["1"]).concat(map.squads.keySeq())),
        squads: map.squads.merge(
          Map(
            squads.map((s) => [
              s.id,
              toMapSquad(
                s,
                map.cities.find((c) => c.id === "castle1")
              ),
            ])
          )
        ),
        units: map.units.merge(alliedUnits),
      },
    },
  ];

  startMapScene(parent, commands);
};
