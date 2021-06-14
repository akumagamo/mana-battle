import { List } from 'immutable';
import { renderRows } from '..';
import { Chara } from '../../../Chara/Model';
import { Unit } from '../../Model';
import { UnitList } from '../Model';
import { pageControls } from '../pageControls';
import clearList from './clearList';

export default (
  unitList: UnitList,
  unit: Unit,
  onRefresh: (cs: List<Chara>) => void
) => {
  unitList.units = unitList.units.filter((u) => u.id !== unit.id);

  clearList(unitList);
  renderRows(unitList);
  pageControls(unitList, onRefresh);
};
