import { destroyImage } from '../../Browser/phaser';
import { Image } from '../../Models';
import { imageMock, sceneMock } from '../../test/mocks';
import createUnit from '../../Unit/createUnit';
import createChara from '../createChara';
import deselectChara from './deselectChara';

jest.mock('../../Browser/phaser');

const chara = () => createChara({ scene: sceneMock(), unit: createUnit() });

it('should do nothing if the chara has no `selectedCharaIndicator`', () => {
  const chara_ = chara();
  expect(chara_.selectedCharaIndicator).toEqual(null);
  deselectChara(chara_);
  expect(chara_.selectedCharaIndicator).toEqual(null);
});
it('should destroy and remove the selection image', () => {
  const chara_ = {
    ...chara(),
    selectedCharaIndicator: (imageMock() as unknown) as Image,
  };

  deselectChara(chara_);
  expect(destroyImage).toHaveBeenCalled();
  expect(chara_.selectedCharaIndicator).toEqual(null);
});
