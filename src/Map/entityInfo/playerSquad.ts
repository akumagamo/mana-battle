import { MapSquad } from "../Model";
import BoardScene from "../../Board/InteractiveBoardScene";
import { PLAYER_FORCE, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { Container } from "../../Models";
import button from "../../UI/button";
import panel from "../../UI/panel";
import SmallUnitDetailsBar from "../../Unit/SmallUnitDetailsBar";
import { MapScene } from "../MapScene";
import dispatchWindow from "../dispatchWindow";
import * as ListSquads from "../../Squad/ListSquadsScene";
import { Map } from "immutable";

export default (
  scene: MapScene,
  baseY: number,
  mapSquad: MapSquad,
  uiContainer: Phaser.GameObjects.Container
) => {
  const baseX = 300;
  const mode = scene.mode.type;


  if (mode === "SQUAD_SELECTED")
    button(baseX + 300, baseY, "Formation", scene.uiContainer, scene, () => {
      scene.changeMode({ type: "CHANGING_SQUAD_FORMATION" });
      const container = scene.add.container();
      panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene);
      let details: Container | null = null;
      const boardScene = new BoardScene(
        mapSquad.squad,
        (updatedSquad) =>
          scene.signal("changed unit position on board, updating", [
            {
              type: "UPDATE_STATE",
              target: {
                ...scene.state,
                squads: scene.state.squads.map((sqd) => {
                  if (sqd.squad.id === updatedSquad.id)
                    return {
                      ...sqd,
                      members: updatedSquad.members,
                    };
                  else return sqd;
                }),
              },
            },
          ]),
        scene.state.units
      );

      scene.scene.add("editSquadInMap", boardScene, true);
      scene.disableMapInput();
      boardScene.makeUnitsClickable((c) => {
        details?.destroy();
        details = SmallUnitDetailsBar(
          10,
          SCREEN_HEIGHT - 100,
          scene,
          scene.state.units.find((u) => u.id === c.unit.id)
        );
        container.add(details);
      });
      button(1100, 300, "Return", container, scene, () => {
        scene.enableInput();
        boardScene.destroy();
        scene.scene.remove("editSquadInMap");
        container.destroy();

        scene.changeMode({ type: "SQUAD_SELECTED", id: mapSquad.squad.id });
      });
    });

  button(50, 40, "Organize", uiContainer, scene, () => {
    console.log("organize btn");

    scene.scene.stop("MapScene");

    // TODO: make all .run calls like this
    ListSquads.run(
      {
        // TODO: only player units
        units: scene.state.units,
        squads: scene.state.squads
          .filter((s) => s.squad.force === PLAYER_FORCE)
          .map((s) => s.squad)
          .reduce((xs, x) => xs.set(x.id, x), Map()),
        dispatched: scene.state.dispatchedSquads,
        // onDisbandSquad: (id: string) => {
        //   console.log(`disbanded!!!`, id);
        //   scene.scene.start("MapScene");
        // },
      },
      scene.scene.manager
    );
  });
  button(250, 40, "Dispatch", uiContainer, scene, () => {
    scene.disableMapInput();
    dispatchWindow(scene);
  });
};
