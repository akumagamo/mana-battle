import { List } from 'immutable';
import { UnitList } from '../Model';

export default (unitList: UnitList) => {
  unitList.container.removeAll(true);
  unitList.charas = List();
};
