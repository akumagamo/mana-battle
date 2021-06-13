import { renderRows } from '..';
import { UnitList } from '../Model';
import { pageControls } from '../pageControls';
import clearList from './clearList';

export default (unitList: UnitList) => {
  clearList(unitList);
  renderRows(unitList);
  pageControls(unitList);
};
