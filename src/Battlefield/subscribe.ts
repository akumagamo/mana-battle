import events from "./events";
import { handleMovePlayerSquadButtonClicked } from "./ui/playerSquad";
import { handleCloseSquadArrivedInfoMessage } from "./events/SquadArrivedInfoMessageClosed";
import { organizeButtonClicked } from "./ui/organizeButtonClicked";
import turnOff from "./turnOff";
import returnButtonClicked from "../Squad/ListSquadsScene/events/returnButtonClicked";
import { handleCellClick } from "./events/CellClicked";
import { getChara, MapState } from "./Model";
import * as selectChara from "../Chara/commands/selectChara";
import deselectAllEntities from "./commands/deselectAllEntities";
import cellRightClicked from "./board/cellRightClicked";
import { onSquadFinishesMovement } from "./events/SquadFinishesMovement";
import { onSquadConquersCity } from "./events/SquadConqueredCity";
import { onPlayerWins } from "./events/PlayerWins";
import { onPlayerLoses } from "./events/PlayerLoses";
import { combatEnded } from "./events/CombatEnded";

export default function (scene: Phaser.Scene, state: MapState) {
  const index = events();

  index.CellClicked(scene).on((c) => handleCellClick(c));

  index
    .MovePlayerSquadButonClicked(scene)
    .on(handleMovePlayerSquadButtonClicked);

  index.CloseSquadArrivedInfoMessage(scene).on((container) => {
    handleCloseSquadArrivedInfoMessage(container);
  });

  index.OrganizeButtonClicked(scene).on(() =>
    organizeButtonClicked(
      {
        turnOff: () => turnOff(scene, state),
        state,
        scene,
      },
      (listScene) => returnButtonClicked(scene, state)(listScene)
    )
  );

  index.SquadClicked(scene).on((mapSquad) => {
    deselectAllEntities(state);

    const chara = getChara(state, mapSquad.id);
    selectChara.emit(chara);
  });

  index.RightButtonClickedOnCell(scene).on(cellRightClicked);
  index.SquadFinishesMovement(scene).on(onSquadFinishesMovement(scene, state));
  index.SquadConqueredCity(scene).on(onSquadConquersCity(scene, state));
  index.PlayerWins(scene).on(onPlayerWins);
  index.PlayerLoses(scene).on(onPlayerLoses);
  index.CombatEnded(scene).on(combatEnded(state));
}
