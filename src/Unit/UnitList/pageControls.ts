import { renderRows } from '.';
import button from '../../UI/button';
import clearList from './actions/clearList';
import { UnitList } from './Model';

export function pageControls(unitList: UnitList) {

  const baseY = 480;

  const totalUnits = unitList.units.size;

  if (unitList.page !== 0) {
    const prev = button(
      unitList.x - 20,
      unitList.y + baseY,
      ' <= ',
      unitList.scene.add.container(),
      unitList.scene,
      () => prevPage(unitList),
      false,
      50
    );
  }

  const isLastPage =
    totalUnits < unitList.itemsPerPage ||
    unitList.itemsPerPage * (unitList.page + 1) >= totalUnits;

  if (!isLastPage) {
    const next = button(
      unitList.x + 50,
      unitList.y + baseY,
      ' => ',
      unitList.scene.add.container(),
      unitList.scene,
      () => nextPage(unitList),
      false,
      50
    );
  }
}

export function nextPage(unitList: UnitList) {
  unitList.page = unitList.page + 1;
  clearList(unitList);
  renderRows(unitList);
  pageControls(unitList)
}

export function prevPage(unitList: UnitList) {
  unitList.page = unitList.page - 1;
  clearList(unitList);
  renderRows(unitList);
  pageControls(unitList)
}
