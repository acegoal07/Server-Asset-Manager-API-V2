import { Hono } from 'hono';

import createGender from './controllers/createGender';
import addSubGenderToGender from './controllers/addSubGenderToGender';

export default new Hono().route('/:id', addSubGenderToGender).route('/', createGender);
