import 'phaser';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from './constants';
import TitleScene from './Scenes/TitleScene';
import {EditSquadScene} from './Squad/EditSquadScene';
import {ListSquadsScene} from './Squad/ListSquadsScene';
import {ListUnitsScene} from './Unit/ListUnits';
import {MapScene} from './Map/MapScene';
import CombatScene from './Combat/CombatScene';
import defaultData from './defaultData';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#125555',
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    TitleScene,
    EditSquadScene,
    ListSquadsScene,
    ListUnitsScene,
    MapScene,
    CombatScene,
  ],
};

const getTimeout = () => {
  if (localStorage.getItem('player') === null) {
    defaultData(true);
    // TODO: improve this
    // Forcing a small delay to allow writing data
    // We can improve this by checking if all keys are available
    return 50;
  } else {
    return 0;
  }
};

setTimeout(() => {
  const game = new Phaser.Game(config);
  game.scale.lockOrientation(Phaser.Scale.PORTRAIT);
}, getTimeout());
