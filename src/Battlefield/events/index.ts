import * as cellClicked from "./CellClicked";
import * as combatInitiated from "./CombatInitiated";
import * as dispatchWindowRendered from "./DispatchWindowRendered";
import * as movePlayerSquadButtonClicked from "./MovePlayerSquadButtonClicked";
import * as organizeButtonClicked from "./OrganizeButtonClicked";
import * as returnedFromCombat from "./ReturnedFromCombat";
import * as SquadArrivedInfoMessageClosed from "./SquadArrivedInfoMessageClosed";
import * as SquadArrivedInfoMessageCompleted from "./SquadArrivedInfoMessageCompleted";
import * as SquadClicked from "./SquadClicked";
import * as SquadDispatched from "./SquadDispatched";

/** This is a function to avoid accessing the `default` property before initialization -
 * which can lead to a webpack error*/
const events = () => ({
  [cellClicked.key]: cellClicked.default,
  [combatInitiated.key]: combatInitiated.default,
  [dispatchWindowRendered.key]: dispatchWindowRendered.default,
  [movePlayerSquadButtonClicked.key]: movePlayerSquadButtonClicked.default,
  [organizeButtonClicked.key]: organizeButtonClicked.default,
  [returnedFromCombat.key]: returnedFromCombat.default,
  [SquadArrivedInfoMessageClosed.key]: SquadArrivedInfoMessageClosed.default,
  [SquadArrivedInfoMessageCompleted.key]:
    SquadArrivedInfoMessageCompleted.default,
  [SquadClicked.key]: SquadClicked.default,
  [SquadDispatched.key]: SquadDispatched.default,
});

export default events;
