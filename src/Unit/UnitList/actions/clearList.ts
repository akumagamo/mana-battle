import { List } from 'immutable';
import { UnitList } from '../Model';

export default (unitList: UnitList) => {
  unitList.charas.forEach((c) => c.destroy());
  unitList.container.removeAll(true);
  unitList.charas = List();
};
