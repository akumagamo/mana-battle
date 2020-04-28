import {Container, Image} from '../../Models';
import {Chara} from '../Chara';

export default (chara:Chara)=>(element: Container | Image | null, bounce: number, duration: number) => chara.tweens.add({
  targets: element,
  y: element ? element.y + bounce : 0,
  yoyo:true,
  duration,
  repeat: -1
});
