import { openApiComponents } from './components';
import { openApiPaths } from './paths';
import type { OpenApiDocument } from './types';

export const openApiSchema: OpenApiDocument = {
   openapi: '3.0.3',

   info: {
      title: 'Asset Management API',
      description: 'API for managing custom asset types and assets.',
      version: '1.0.0'
   },

   servers: [
      {
         url: 'http://localhost:3000/api/v1'
      }
   ],

   tags: [
      {
         name: 'Assets',
         description: 'Asset management'
      },
      {
         name: 'Storages',
         description: 'Storage management'
      },
      {
         name: 'Groups',
         description: 'Group management'
      },
      {
         name: 'Types',
         description: 'Asset and storage type management'
      }
   ],

   paths: openApiPaths,
   components: openApiComponents
} as const;
