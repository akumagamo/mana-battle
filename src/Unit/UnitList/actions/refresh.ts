import { List } from 'immutable';
import { renderRows } from '..';
import { Chara } from '../../../Chara/Model';
import { UnitList } from '../Model';
import { pageControls } from '../pageControls';
import clearList from './clearList';

export default (
  unitList: UnitList,
  onRefresh: (charas: List<Chara>) => void
) => {
  console.log(`refreshing`);
  clearList(unitList);
  renderRows(unitList);
  pageControls(unitList, onRefresh);

  onRefresh(unitList.charas);
};
