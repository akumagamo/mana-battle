import { renderRows } from '.';
import { SCREEN_HEIGHT } from '../../constants';
import button from '../../UI/button';
import clearList from './actions/clearList';
import { UnitList } from './Model';

export function pageControls(unitList: UnitList) {
  const baseX = 30;
  const baseY = SCREEN_HEIGHT - 100;

  const totalUnits = unitList.units.size;

  if (unitList.page !== 0) {
    const container = unitList.scene.add.container();
    unitList.container.add(container);
    button(
      baseX,
      baseY,
      ' <= ',
      container,
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
    const container = unitList.scene.add.container();
    unitList.container.add(container);
    button(
      baseX + 60,
      baseY,
      ' => ',
      container,
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
  pageControls(unitList);
}

export function prevPage(unitList: UnitList) {
  unitList.page = unitList.page - 1;
  clearList(unitList);
  renderRows(unitList);
  pageControls(unitList);
}
