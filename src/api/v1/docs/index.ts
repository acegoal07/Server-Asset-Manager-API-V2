import { Hono } from 'hono';
import generateOpenApi from './controllers/generateOpenApi';
import swagger from './controllers/swagger';

export default new Hono().route('/openapi.json', generateOpenApi).route('/', swagger);
