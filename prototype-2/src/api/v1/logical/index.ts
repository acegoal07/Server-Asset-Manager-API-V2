import { Hono } from 'hono';

import genders from './genders';
import subGenders from './subGenders';

export default new Hono().route('/genders', genders).route('/subgenders', subGenders);
