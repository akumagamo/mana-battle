import { MapScene } from "./MapScene";
import events from "./events";
import { handleMovePlayerSquadButtonClicked } from "./ui/playerSquad";
import { handleCloseSquadArrivedInfoMessage } from "./events/SquadArrivedInfoMessageClosed";
import { organizeButtonClicked } from "./ui/organizeButtonClicked";
import turnOff from "./turnOff";
import returnButtonClicked from "../Squad/ListSquadsScene/events/returnButtonClicked";
import { handleCellClick } from "./events/CellClicked";
import { getChara, MapState } from "./Model";

export default function (scene: MapScene, state: MapState) {
  // IDEA: provide state and scene to all events, making them automatically bound
  const events_ = events();
  events_.CellClicked(scene).on((c) => handleCellClick(c));
  events_
    .MovePlayerSquadButonClicked(scene)
    .on((c) => handleMovePlayerSquadButtonClicked(c));
  events_
    .SquadArrivedInfoMessageCompleted(scene)
    .on((chara) => handleCloseSquadArrivedInfoMessage(scene, state, chara));
  events_.OrganizeButtonClicked(scene).on(() =>
    organizeButtonClicked(
      {
        turnOff: () => turnOff(scene, state),
        state,
        scene,
      },
      (listScene) => returnButtonClicked(scene, state)(listScene)
    )
  );
  events_.SquadClicked(scene).on((mapSquad) => {
    state.charas.forEach((c) => c.events.deselect());
    const chara = getChara(state, mapSquad.id);
    chara.events.select();
  });
}
