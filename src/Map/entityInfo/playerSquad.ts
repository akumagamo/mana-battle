import { MapSquad } from "../Model";
import BoardScene from "../../Board/InteractiveBoardScene";
import { PLAYER_FORCE, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { Container } from "../../Models";
import button from "../../UI/button";
import panel from "../../UI/panel";
import SmallUnitDetailsBar from "../../Unit/SmallUnitDetailsBar";
import { MapScene } from "../MapScene";
import dispatchWindow from "../dispatchWindow";

export default (
  scene: MapScene,
  baseY: number,
  squad: MapSquad,
  uiContainer: Phaser.GameObjects.Container
) => {
  const baseX = 300;
  const mode = scene.mode.type;
  if (mode !== "MOVING_SQUAD" && mode !== "SELECTING_ATTACK_TARGET") {
    const event = () => {
      scene.showMoveControls(squad);
    };
    button(
      baseX + 100,
      baseY,
      "Move",
      scene.uiContainer,
      scene,
      event,
      scene.inactiveSquads.has(squad.id)
    );
    //@ts-ignore
    window.moveButton = event;
  }

  if (mode !== "SELECTING_ATTACK_TARGET") {
    const event = () => scene.showAttackControls(squad);

    //@ts-ignore
    window.clickAttack = event;
    button(
      baseX + 200,
      baseY,
      "Attack",
      scene.uiContainer,
      scene,
      event,
      scene.getTargets(squad.pos).length < 1 ||
        scene.inactiveSquads.has(squad.id)
    );
  }

  if (mode === "SQUAD_SELECTED")
    button(baseX + 300, baseY, "Formation", scene.uiContainer, scene, () => {
      scene.changeMode({ type: "CHANGING_SQUAD_FORMATION" });
      const container = scene.add.container();
      panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene);
      let details: Container | null = null;
      const boardScene = new BoardScene(squad, (updatedSquad) =>
        scene.signal("changed unit position on board, updating", [
          {
            type: "UPDATE_STATE",
            target: {
              ...scene.state,
              squads: scene.state.squads.map((sqd) => {
                if (sqd.id === updatedSquad.id)
                  return {
                    ...sqd,
                    members: updatedSquad.members,
                  };
                else return sqd;
              }),
            },
          },
        ]), scene.state.units
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

        scene.changeMode({ type: "SQUAD_SELECTED", id: squad.id });
      });
    });

  if (mode == "SELECTING_ATTACK_TARGET" || mode === "MOVING_SQUAD")
    button(1150, baseY, "Cancel", uiContainer, scene, async () => {
      switch (scene.mode.type) {
        case "SELECTING_ATTACK_TARGET":
          scene.changeMode({ type: "SQUAD_SELECTED", id: squad.id });
          scene.signal('cancelled squad targeting"', [
            { type: "CLEAR_TILES_TINTING" },
          ]);
          break;
        case "MOVING_SQUAD":
          const { start, id } = scene.mode;
          await scene.moveSquadTo(squad.id, start);

          scene.signal('cancelled movement"', [
            { type: "CLEAR_TILES_TINTING" },
            { type: "HIGHLIGHT_CELL", pos: start },

            {
              type: "UPDATE_SQUAD_POS",
              id,
              pos: start,
            },
          ]);

          scene.changeMode({ type: "SQUAD_SELECTED", id });
          break;
      }
    });

  if (mode === "MOVING_SQUAD" || mode == "SQUAD_SELECTED") {
    const event = () => {
      scene.signal('clicked "end squad turn"', [
        { type: "END_SQUAD_TURN", id: squad.id },
      ]);
    };
    button(baseX + 700, baseY, "Wait", uiContainer, scene, event);

    //@ts-ignore
    window.clickWait = event;
  }

  button(50, 40, "Organize", uiContainer, scene, () => {
    console.log("organize btn");

    scene.scene.stop("MapScene");

    scene.scene.run("ListSquadsScene", {
      // TODO: only player units
      units: scene.state.units,
      squads: scene.state.squads.filter((s) => s.force === PLAYER_FORCE),
      dispatched: scene.state.dispatchedSquads,
      onDisbandSquad: (id: string) => {
        console.log(`disbanded!!!`, id);
        scene.scene.start("MapScene");
      },
    });
  });
  button(250, 40, "Dispatch", uiContainer, scene, () => {
    scene.disableMapInput();
    dispatchWindow(scene);
  });
};
