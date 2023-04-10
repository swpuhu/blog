import { Effect } from './renderer/Effect';
import vert from './shader/normalVert.glsl';
import frag from './shader/normalTextureFrag.glsl';

const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');

new Effect(gl!, vert, frag);

export const a = 1;
