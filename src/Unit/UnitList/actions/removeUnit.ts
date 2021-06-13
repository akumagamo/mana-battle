import { renderRows } from '..';
import { Unit } from '../../Model';
import { UnitList } from '../Model';
import { pageControls } from '../pageControls';
import clearList from './clearList';

export default (unitList: UnitList, unit: Unit) => {
  unitList.units = unitList.units.filter((u) => u.id !== unit.id);

  clearList(unitList);
  renderRows(unitList);
  pageControls(unitList);
};
