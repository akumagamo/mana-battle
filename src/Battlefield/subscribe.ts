import { MapScene } from "./MapScene";
import events from "./events";
import { handleMovePlayerSquadButtonClicked } from "./ui/playerSquad";
import { handleCloseSquadArrivedInfoMessage } from "./events/SquadArrivedInfoMessageClosed";
import { organizeButtonClicked } from "./ui/organizeButtonClicked";
import turnOff from "./turnOff";
import returnButtonClicked from "../Squad/ListSquadsScene/events/returnButtonClicked";
import { handleCellClick } from "./events/CellClicked";

export default function (scene: MapScene) {
  events.CellClicked(scene).on((c) => handleCellClick(c));
  events
    .MovePlayerSquadButonClicked(scene)
    .on((c) => handleMovePlayerSquadButtonClicked(c));
  events
    .SquadArrivedInfoMessageCompleted(scene)
    .on((chara) => handleCloseSquadArrivedInfoMessage(scene, chara));
  events.OrganizeButtonClicked(scene).on(() =>
    organizeButtonClicked(
      {
        turnOff: () => turnOff(scene),
        state: scene.state,
        scene: scene.scene,
      },
      (listScene) => returnButtonClicked(scene)(listScene)
    )
  );
}
