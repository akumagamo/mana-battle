import createChara from '../createChara';
import { Chara } from '../Model';

export default (chara: Chara) => {
  chara.props.front = !chara.props.front;
  chara.destroy();
  createChara(chara.props);
};