import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';
import OptionsScene from './Scenes/OptionsScene';
import WorldScene from './Scenes/World';
import { ListSquadsScene } from './Squad/ListSquadsScene/ListSquadsScene';
import { ListUnitsScene } from './Unit/ListUnits';
import MapListScene from './Map/MapListScene';
import CombatScene from './Combat/CombatScene';
import { endToEndTesting } from './endToEndTesting';
import TitleScene from './Scenes/Title/TitleScene';

(() => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [TitleScene, ListSquadsScene, CombatScene, OptionsScene],
    dom: {
      createContainer: true,
    },
    parent: 'content',
  };

  const game = new Phaser.Game(config);
  game.scale.lockOrientation(Phaser.Scale.PORTRAIT);

  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.game = game;

    endToEndTesting(game);
  }
})();
