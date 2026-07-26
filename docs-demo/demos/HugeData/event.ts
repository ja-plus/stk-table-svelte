import mitt from 'mitt';
import type { DataType } from './types';

export const emitter = mitt<{
    'toggle-expand': DataType;
}>();
