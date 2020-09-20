import {City, CPU_FORCE} from '../../API/Map/Model';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../../constants';
import {MapScene} from '../MapScene';
import * as S from 'sanctuary';

export default (scene: MapScene) => {
  const title = scene.label(SCREEN_WIDTH / 2, 60, 'Victory Condition');
  title.setAlpha(0);

  S.pipe([
    S.prop('cities'),
    S.find<City>((c) => c.type === 'castle' && c.force === CPU_FORCE),
    S.map<City, void>((c) => {
      scene
        .delay(500)
        .then(() =>
          scene.tween({
            targets: title,
            alpha: 1,
            duration: 1000,
          }),
        )
        .then(() => scene.delay(500))
        .then(() => scene.moveCameraTo(c, 1000))
        .then(() => {
          const conquer = scene.label(
            SCREEN_WIDTH / 2,
            160,
            'Conquer enemy headquarters',
          );

          conquer.setAlpha(0);
          return scene.tween({
            targets: conquer,
            alpha: 1,
            duration: 500,
          });
        })
        .then(() => {
          const pic = scene.add.sprite(SCREEN_WIDTH / 2, 350, 'merano');
          pic.setOrigin(0.5);
          pic.setDisplaySize(250, 250);
          const name = scene.label(SCREEN_WIDTH / 2, 520, 'Merano Castle');

          pic.setAlpha(0);
          name.setAlpha(0);

          scene.missionContainer.add(pic);

          return scene.tween({
            targets: [pic, name],
            alpha: 1,
            duration: 1000,
          });
        })
        .then(() => scene.delay(1000))
        .then(() => {
          return scene.tween({
            targets: scene.missionContainer,
            alpha: 0,
            duration: 1000,
          });
        })
        .then(() => {
          scene.missionContainer.destroy();
          scene.missionContainer = scene.add.container();
          const start = scene.label(
            SCREEN_WIDTH / 2,
            SCREEN_HEIGHT / 2,
            'Mission Start',
          );
          start.setAlpha(0);
          return scene.tween({
            targets: start,
            alpha: 1,
            duration: 1000,
          });
        })
        .then(() => scene.delay(1000))
        .then(() =>
          scene.tween({
            targets: scene.missionContainer,
            alpha: 0,
            duration: 1000,
          }),
        )
        .then(() => scene.runTurn());
    }),
  ])(scene.state);
};
