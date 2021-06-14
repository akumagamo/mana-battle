import createBoard from '../../Board/createBoard';
import onBoardUnitClicked from '../../Board/events/onBoardUnitClicked';
import { Board } from '../../Board/Model';
import onEnableDrag from '../../Chara/events/onEnableDrag';
import { Chara } from '../../Chara/Model';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants';
import { Vector } from '../../Map/Model';
import { Container } from '../../Models';
import button from '../../UI/button';
import panel from '../../UI/panel';
import { Unit, UnitIndex } from '../../Unit/Model';
import SmallUnitDetailsBar from '../../Unit/SmallUnitDetailsBar';
import { createUnitList } from '../../Unit/UnitList';
import { UnitList } from '../../Unit/UnitList/Model';
import { SceneEventFactory, EventFactory } from '../../utils';
import * as Squad from '../Model';
import onDragEndFromUnitList from './events/onDragEndFromUnitList';
import onDragFromUnitList from './events/onDragFromUnitList';
import { onCloseModal } from './events/onCloseModal';
import { List } from 'immutable';
import handleUnitDrag from '../../Unit/UnitList/actions/handleUnitDrag';

const GAME_SPEED = parseInt(process.env.SPEED);

export const componentEvents = {
  ADD_UNIT_BUTTON_CLICKED: 'ADD_UNIT_BUTTON_CLICKED',
  ON_DRAG: 'ON_DRAG',
  ON_DRAG_END: 'ON_DRAG_END',
  ON_CLOSE: 'ON_CLOSE',
};

export type EditSquadModalEvents = {
  //OnDragFromUnitList: EventFactory<Vector>;
  //OnDragEndFromUnitList: EventFactory<{ pos: Vector; unit: Unit }>;
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
  const boardScene = createBoard(
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

  const refresher = (charas: List<Chara>) => {
    charas.forEach((chara) => {
      onEnableDrag(
        chara,
        (unit, x, y, chara) => {
          handleUnitDrag(listScene, unit, x, y, chara, () => {
            onDragFromUnitList(listScene, boardScene, x, y);
          });
        },
        (chara) => (x, y) => {
          onDragEndFromUnitList(
            x,
            y,
            listScene,
            boardScene,
            chara,
            onSquadUpdated,
            refresher
          );
          console.log(`drag end`);
        }
      );
    });
  };

  const listScene = createUnitList(scene, 30, 30, 5, units.toList(), refresher);
  //if (addUnitEnabled)

  const events: EditSquadModalEvents = createEvents(
    scene,
    boardScene,
    listScene,
    onClose,
    onSquadUpdated,
    refresher
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
    // OnDragFromUnitList: SceneEventFactory<Vector>(
    //   scene,
    //   componentEvents.ON_DRAG
    // ),
    // OnDragEndFromUnitList: SceneEventFactory<{ pos: Vector; unit: Unit }>(
    //   scene,
    //   componentEvents.ON_DRAG_END
    // ),
    OnClose: SceneEventFactory<null>(scene, componentEvents.ON_CLOSE),
  };

  // events.OnDragFromUnitList.on(({ x, y }: { x: number; y: number }) =>
  //   onDragFromUnitList(listScene, boardScene, x, y)
  // );
  // events.OnDragEndFromUnitList.on(
  //   ({ pos, chara }: { pos: Vector; unit: Unit; chara: Chara }) =>
  //     onDragEndFromUnitList(
  //       pos.x,
  //       pos.y,
  //       listScene,
  //       boardScene,
  //       chara,
  //       onSquadUpdated,
  //       refresher
  //     )
  // );
  events.OnClose.on(() => {
    onCloseModal(listScene, boardScene, scene, onClose);
  });

  return events;
}
