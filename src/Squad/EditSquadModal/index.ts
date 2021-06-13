import createStaticBoard from '../../Board/createBoard';
import onBoardUnitClicked from '../../Board/events/onBoardUnitClicked';
import findTileByXY from '../../Board/findTileByXY';
import highlightTile from '../../Board/highlightTile';
import { StaticBoard } from '../../Board/Model';
import onEnableDrag from '../../Chara/events/onEnableDrag';
import { Chara } from '../../Chara/Model';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants';
import { Vector } from '../../Map/Model';
import { Container } from '../../Models';
import button from '../../UI/button';
import panel from '../../UI/panel';
import { Unit, UnitIndex } from '../../Unit/Model';
import SmallUnitDetailsBar from '../../Unit/SmallUnitDetailsBar';
import { createUnitList, reposition, scaleDown } from '../../Unit/UnitList';
import addUnit from '../../Unit/UnitList/actions/addUnit';
import removeUnit from '../../Unit/UnitList/actions/removeUnit';
import { UnitList } from '../../Unit/UnitList/Model';
import { SceneEventFactory, EventFactory } from '../../utils';
import * as Squad from '../Model';
import removeCharaFromBoard from './actions/removeCharaFromBoard';
import onDragEndFromUnitList from './events/onDragEndFromUnitList';
import onDragFromUnitList from './events/onDragFromUnitList';
import { onCloseModal } from './events/onCloseModal';

const GAME_SPEED = parseInt(process.env.SPEED);

export const componentEvents = {
  ADD_UNIT_BUTTON_CLICKED: 'ADD_UNIT_BUTTON_CLICKED',
  ON_DRAG: 'ON_DRAG',
  ON_DRAG_END: 'ON_DRAG_END',
  ON_CLOSE: 'ON_CLOSE',
};

export type EditSquadModalEvents = {
  OnDragFromUnitList: EventFactory<Vector>;
  OnDragEndFromUnitList: EventFactory<{ pos: Vector; unit: Unit }>;
  OnClose: EventFactory<null>;
};

export default function (
  /** Any scene that wants to use this component needs to register events locally */
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  squad: Squad.SquadRecord,
  units: UnitIndex,
  addUnitEnabled: boolean,
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void,
  onClose: (s: Squad.SquadRecord) => void
) {
  const boardScene = createStaticBoard(
    scene,
    squad,
    units,
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 4,
    1,
    true,
    false,
    {
      onDragStart: (u, x, y, chara) => {},
      onDragEnd: (chara) => (x, y) => {}, // todo: event to remove unit
      onSquadUpdated: onSquadUpdated,
    }
  );

  //if (addUnitEnabled)
  const listScene = createUnitList(scene, 30, 30, 5, units.toList());

  listScene.charas.forEach((chara) => {
    onEnableDrag(
      chara,
      () => {
        console.log(`drag`);
      },
      () => () => {
        console.log(`drag end`);
      }
    );
  });

  const events: EditSquadModalEvents = createEvents(
    scene,
    boardScene,
    listScene,
    onClose,
    onSquadUpdated
  );

  const panel_ = panel(
    -SCREEN_WIDTH / 2,
    -SCREEN_HEIGHT / 4,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    boardScene.container,
    boardScene.scene
  );
  boardScene.container.sendToBack(panel_);
  let details: Container | null = null;

  onBoardUnitClicked(boardScene, (c) => {
    details?.destroy();
    details = SmallUnitDetailsBar(
      330,
      SCREEN_HEIGHT - 160,
      boardScene.scene,
      units.find((u) => u.id === c.props.unit.id)
    );
    boardScene.container.add(details);
  });
  button(
    0,
    SCREEN_HEIGHT - 350,
    'Confirm',
    boardScene.container,
    boardScene.scene,
    () => events.OnClose.emit(null)
  );

  return events;
}

function createEvents(
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  boardScene: StaticBoard,
  listScene: UnitList,
  onClose: { (s: Squad.SquadRecord): void; (arg0: Squad.SquadRecord): void },
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void
) {
  const events: EditSquadModalEvents = {
    OnDragFromUnitList: SceneEventFactory<Vector>(
      scene,
      componentEvents.ON_DRAG
    ),
    OnDragEndFromUnitList: SceneEventFactory<{ pos: Vector; unit: Unit }>(
      scene,
      componentEvents.ON_DRAG_END
    ),
    OnClose: SceneEventFactory<null>(scene, componentEvents.ON_CLOSE),
  };

  events.OnDragFromUnitList.on(({ x, y }: { x: number; y: number }) =>
    onDragFromUnitList(listScene, boardScene, x, y)
  );
  events.OnDragEndFromUnitList.on(
    ({ pos, chara }: { pos: Vector; unit: Unit; chara: Chara }) =>
      onDragEndFromUnitList(
        pos.x,
        pos.y,
        listScene,
        boardScene,
        chara,
        onSquadUpdated
      )
  );
  events.OnClose.on(() => {
    onCloseModal(listScene, boardScene, scene, onClose);
  });

  return events;
}
