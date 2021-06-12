import {Chara} from "../Chara";

export default (chara: Chara) => {
  chara.props.front = !chara.props.front;
  chara.charaWrapper.destroy();
  chara.create();
};
