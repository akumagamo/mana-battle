import { destroyImage } from '../../Browser/phaser';
import { EventEmitter } from '../../Models';
import { createEvent } from '../../utils';
import { Chara } from '../Model';

const event = (emitter: EventEmitter) =>
  createEvent<Chara>(emitter, 'deselectChara');

export default function deselectChara(chara: Chara) {
  if (chara.selectedCharaIndicator) {
    destroyImage(chara.selectedCharaIndicator);
    chara.selectedCharaIndicator = null;
  }
}

export function subscribe(chara: Chara) {
  event(chara.container).on(deselectChara);
}

export function emit(chara: Chara) {
  event(chara.container).emit(chara);
}
