import {MapSquad} from "../Model";
import BoardScene from "../../Board/InteractiveBoardScene";
import {SCREEN_HEIGHT, SCREEN_WIDTH} from "../../constants";
import {Container} from "../../Models";
import button from "../../UI/button";
import panel from "../../UI/panel";
import SmallUnitDetailsBar from "../../Unit/SmallUnitDetailsBar";
import {MapScene} from "../MapScene";

export function formationBtn(scene: MapScene, mapSquad: MapSquad) {
  scene.changeMode({type: "CHANGING_SQUAD_FORMATION"});
  const container = scene.add.container();
  panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene);
  let details: Container | null = null;
  const boardScene = new BoardScene(
    mapSquad.squad,
    (updatedSquad) => scene.signal("changed unit position on board, updating", [
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

            else
              return sqd;
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
      scene.state.units.find((u) => u.id === c.props.unit.id)
    );
    container.add(details);
  });
  button(1100, 300, "Return", container, scene, () => {
    scene.enableInput();
    boardScene.destroy();
    scene.scene.remove("editSquadInMap");
    container.destroy();

    scene.changeMode({type: "SQUAD_SELECTED", id: mapSquad.squad.id});
  });
}

