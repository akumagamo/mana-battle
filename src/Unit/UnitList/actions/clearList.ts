import { UnitList } from '../Model';

export default (unitList: UnitList) => {
  unitList.container.destroy();
};
