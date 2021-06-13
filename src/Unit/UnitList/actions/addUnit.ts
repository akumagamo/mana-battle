import { Unit } from '../../Model';
import { UnitList } from '../Model';
import renderListItem from '../renderListItem';

export default (unitList: UnitList, unit: Unit) => {
  unitList.units = unitList.units.push(unit);

  if (unitList.units.size < unitList.itemsPerPage) {
    renderListItem(unitList, unit, unitList.units.size - 1);
  }
};
