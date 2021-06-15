import createBoard from '../../Board/createBoard';
import onBoardUnitClicked from '../../Board/events/onBoardUnitClicked';
import { Board } from '../../Board/Model';
import onEnableDrag from '../../Chara/events/onEnableDrag';
import { Chara } from '../../Chara/Model';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants';
import { Container } from '../../Models';
import button from '../../UI/button';
import panel from '../../UI/panel';
import { Unit, UnitIndex } from '../../Unit/Model';
import SmallUnitDetailsBar from '../../Unit/SmallUnitDetailsBar';
import createUnitList from '../../Unit/UnitList/createUnitList';
import { UnitList } from '../../Unit/UnitList/Model';
import { SceneEventFactory, EventFactory } from '../../utils';
import * as Squad from '../Model';
import onDragEndFromUnitList from './events/onDragEndFromUnitList';
import onDragFromUnitList from './events/onDragFromUnitList';
import { onCloseModal } from './events/onCloseModal';
import { List } from 'immutable';
import handleUnitDrag from '../../Unit/UnitList/actions/handleUnitDrag';

export const componentEvents = {
  ADD_UNIT_BUTTON_CLICKED: 'ADD_UNIT_BUTTON_CLICKED',
  ON_DRAG: 'ON_DRAG',
  ON_DRAG_END: 'ON_DRAG_END',
  ON_CLOSE: 'ON_CLOSE',
};

export type EditSquadModalEvents = {
  OnClose: EventFactory<null>;
};

export default function ({
  scene,
  squad,
  units,
  addUnitEnabled,
  onSquadUpdated,
  onClose,
}: {
  /** Any scene that wants to use this component needs to register events locally */
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents };
  squad: Squad.SquadRecord;
  units: UnitIndex;
  addUnitEnabled: boolean;
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void;
  onClose: (s: Squad.SquadRecord) => void;
}) {
  const board = createBoard(
    scene,
    squad,
    units,
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 4,
    1,
    true,
    false,
    {
      onDragStart: () => {},
      onDragEnd: () => () => {},
      onSquadUpdated: onSquadUpdated,
    }
  );

  const onListUpdated = (charas: List<Chara>) => {
    charas.forEach((chara) => {
      onEnableDrag(
        chara,
        (unit, x, y, chara) => {
          handleUnitDrag(listScene, unit, x, y, chara, () => {
            onDragFromUnitList(listScene, board, x, y);
          });
        },
        (chara) => (x, y) => {
          onDragEndFromUnitList(
            x,
            y,
            listScene,
            board,
            chara,
            onSquadUpdated,
            onListUpdated
          );
        }
      );
    });
  };

  const listScene = createUnitList(
    scene,
    30,
    30,
    5,
    units.toList().filter((u) => !u.squad),
    onListUpdated
  );

  const events: EditSquadModalEvents = createEvents(
    scene,
    board,
    listScene,
    onClose,
    onSquadUpdated,
    onListUpdated
  );

  const panel_ = panel(
    -SCREEN_WIDTH / 2,
    -SCREEN_HEIGHT / 4,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    board.container,
    board.scene
  );
  board.container.sendToBack(panel_);
  let details: Container | null = null;

  onBoardUnitClicked(board, (c) => {
    details?.destroy();
    details = SmallUnitDetailsBar(
      330,
      SCREEN_HEIGHT - 160,
      board.scene,
      units.find((u) => u.id === c.props.unit.id)
    );
    board.container.add(details);
  });
  button(0, SCREEN_HEIGHT - 350, 'Confirm', board.container, board.scene, () =>
    events.OnClose.emit(null)
  );

  return events;
}

function createEvents(
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  boardScene: Board,
  listScene: UnitList,
  onClose: { (s: Squad.SquadRecord): void; (arg0: Squad.SquadRecord): void },
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void,
  refresher: { (charas: List<Chara>): void; (cs: List<Chara>): void }
) {
  const events: EditSquadModalEvents = {
    OnClose: SceneEventFactory<null>(scene, componentEvents.ON_CLOSE),
  };

  events.OnClose.on(() => {
    onCloseModal(listScene, boardScene, scene, onClose);
  });

  return events;
}
