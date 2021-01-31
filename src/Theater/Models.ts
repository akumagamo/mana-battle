import { CreateUnit } from './cmds/createUnit';
import { Speak } from './cmds/speak';
import { Wait } from './cmds/wait';
import { Walk } from './cmds/walk';
import { FlipUnit } from './cmds/flipUnit';
import { Answer, Question } from './cmds/question';

export type Background =
  | 'plains'
  | 'woods'
  | 'castle'
  | 'backgrounds/throne_room';

export interface SceneConfig {
  background: Background;
  steps: Cmd[];
  resolve?: () => void;
}

export type Finish = { type: 'FINISH' };

export type Cmd =
  | CreateUnit
  | Wait
  | Speak
  | Walk
  | FlipUnit
  | Question
  | Finish;
