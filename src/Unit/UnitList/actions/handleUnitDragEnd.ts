import { List } from 'immutable';
import { Chara } from '../../../Chara/Model';
import { UnitList } from '../Model';
import refresh from './refresh';

export default (unitList: UnitList, onRefresh: (cs: List<Chara>) => void) => {
  refresh(unitList, onRefresh);
};
