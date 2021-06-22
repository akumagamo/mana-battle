import { MapScene } from "./MapScene";
import events from "./events";
import { handleMovePlayerSquadButtonClicked } from "./ui/playerSquad";
import { handleCloseSquadArrivedInfoMessage } from "./events/SquadArrivedInfoMessageClosed";
import { organizeButtonClicked } from "./ui/organizeButtonClicked";
import turnOff from "./turnOff";
import returnButtonClicked from "../Squad/ListSquadsScene/events/returnButtonClicked";
import { handleCellClick } from "./events/CellClicked";

export default function (scene: MapScene) {
  const events_ = events();
  events_.CellClicked(scene).on((c) => handleCellClick(c));
  events_
    .MovePlayerSquadButonClicked(scene)
    .on((c) => handleMovePlayerSquadButtonClicked(c));
  events_
    .SquadArrivedInfoMessageCompleted(scene)
    .on((chara) => handleCloseSquadArrivedInfoMessage(scene, chara));
  events_.OrganizeButtonClicked(scene).on(() =>
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
