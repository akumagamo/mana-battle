import { MapScene } from "./MapScene";
import events from "./events";
import { handleMovePlayerSquadButtonClicked } from "./ui/playerSquad";
import { handleCloseSquadArrivedInfoMessage } from "./events/SquadArrivedInfoMessageClosed";
import { organizeButtonClicked } from "./ui/organizeButtonClicked";
import turnOff from "./turnOff";
import returnButtonClicked from "../Squad/ListSquadsScene/events/returnButtonClicked";
import { handleCellClick } from "./events/CellClicked";
import { getChara, MapState } from "./Model";
import * as deselectChara from "../Chara/commands/deselectChara";
import * as selectChara from "../Chara/commands/selectChara";

export default function (scene: MapScene, state: MapState) {
  const index = events();

  index.CellClicked(scene).on((c) => handleCellClick(c));

  index
    .MovePlayerSquadButonClicked(scene)
    .on((c) => handleMovePlayerSquadButtonClicked(c));

  index.CloseSquadArrivedInfoMessage(scene).on((chara) => {
    handleCloseSquadArrivedInfoMessage(scene, state, chara);
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
    state.charas.forEach(deselectChara.emit);
    const chara = getChara(state, mapSquad.id);

    selectChara.emit(chara);
  });
}
