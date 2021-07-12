import {Record} from 'immutable';

export const makeVector = Record({x: 0, y: 0});

export type VectorRec = Record<{x: number; y: number}>;
