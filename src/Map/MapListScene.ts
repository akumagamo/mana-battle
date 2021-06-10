import Phaser from "phaser";
import { preload } from "../preload";
import button from "../UI/button";
import maps from "../maps";
import { MapCommands } from "./MapCommands";
import { toMapSquad } from "../Unit/Model";
import { Container } from "../Models";
import { MapState } from "./Model";
import { fadeIn } from "../UI/Transition";
import { List, Set } from "immutable";
import { SquadRecord } from "../Squad/Model";

const GAME_SPEED = parseInt(process.env.SPEED);

export default class MapListScene extends Phaser.Scene {
  constructor(public speed: number) {
    super("MapListScene");
  }
  preload = preload;

  create() {
    const bg = this.add.image(0, 0, "map_select");
    bg.setOrigin(0);
    const container = this.add.container(100, 100);

    maps.forEach((m, i) => this.renderMapListItem(m, i, container));

    fadeIn(this, 1000 / this.speed);
  }
  renderMapListItem = (
    map_: () => MapState,
    index: number,
    container: Container
  ) => {
    const map = map_();
    button(0, index * 100, map.name, container, this, () =>
      this.onMapSelected(index)
    );
  };

  onMapSelected(n: number) {
    // const map = maps[n]();

    // this.cameras.main.fadeOut(1000/ GAME_SPEED, 0, 0, 0);

    // const alliedUnits = getUnitsFromDB();

    // const firstSquad = getSquadsFromDB().first<SquadRecord>().id;

    // let commands: MapCommands[] = [
    //   {
    //     type: "UPDATE_STATE",
    //     target: {
    //       ...map,
    //       dispatchedSquads: Set(List([firstSquad]).concat(map.squads.keySeq())),
    //       squads: map.squads.merge(
    //         getSquadsFromDB().map((s) =>
    //           toMapSquad(
    //             s,
    //             map.cities.find((c) => c.id === "castle1")
    //           )
    //         )
    //       ),

    //       units: map.units.merge(alliedUnits),
    //     },
    //   },
    // ];

    // this.scene.transition({
    //   target: "MapScene",
    //   duration: 1000,
    //   moveBelow: true,
    //   data: commands,
    // });
  }
}
