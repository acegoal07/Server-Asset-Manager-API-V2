import type { OpenApiSchema } from './types';

export const openApiComponents = {
   parameters: {
      Id: {
         name: 'id',
         in: 'path',
         required: true,

         description: 'Numeric resource ID',

         schema: {
            type: 'integer',
            minimum: 1
         },

         example: 1
      }
   },

   schemas: {
      Asset: {
         type: 'object',

         properties: {
            id: {
               type: 'integer',
               example: 1
            },

            name: {
               type: 'string',
               example: 'Production Server'
            },

            notes: {
               type: 'string',
               nullable: true,
               example: 'Main production server'
            },

            uSize: {
               type: 'integer',
               example: 0
            },

            uTop: {
               type: 'integer',
               example: 0
            },

            uBottom: {
               type: 'integer',
               example: 0
            },

            assetTypeId: {
               type: 'integer',
               nullable: true,
               example: 1
            },

            assetTypeName: {
               type: 'string',
               nullable: true,
               example: 'Server'
            },

            data: {
               type: 'array',

               items: {
                  $ref: '#/components/schemas/AssetData'
               }
            }
         }
      },

      AssetData: {
         type: 'object',

         properties: {
            id: {
               type: 'integer'
            },

            fieldId: {
               type: 'integer'
            },

            value: {
               type: 'string',
               nullable: true
            },

            assetTypeId: {
               type: 'integer'
            },

            name: {
               type: 'string',
               nullable: true
            },

            type: {
               type: 'string',
               nullable: true
            }
         }
      },

      CreateAssetRequest: {
         type: 'object',

         required: ['name', 'assetTypeId', 'data'],

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            notes: {
               type: 'string',
               nullable: true
            },

            uSize: {
               type: 'integer',
               example: 0
            },

            uTop: {
               type: 'integer',
               example: 0
            },

            uBottom: {
               type: 'integer',
               example: 0
            },

            assetTypeId: {
               type: 'integer',
               minimum: 1
            },

            data: {
               type: 'object',

               additionalProperties: {
                  type: 'string'
               }
            }
         }
      },

      UpdateAssetRequest: {
         type: 'object',

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            notes: {
               type: 'string',
               nullable: true
            },

            uSize: {
               type: 'integer',
               example: 0
            },

            uTop: {
               type: 'integer',
               example: 0
            },

            uBottom: {
               type: 'integer',
               example: 0
            },

            data: {
               type: 'object',

               additionalProperties: {
                  type: 'string'
               }
            }
         }
      },

      Storage: {
         type: 'object',

         properties: {
            id: {
               type: 'integer',
               example: 1
            },

            name: {
               type: 'string',
               example: 'Rack1'
            },

            notes: {
               type: 'string',
               nullable: true,
               example: 'Some notes about this rack'
            },

            storageTypeId: {
               type: 'integer',
               nullable: true,
               example: 1
            },

            storageTypeName: {
               type: 'string',
               nullable: true,
               example: 'Rack'
            },

            data: {
               type: 'array',

               items: {
                  $ref: '#/components/schemas/StorageData'
               }
            }
         }
      },

      StorageData: {
         type: 'object',

         properties: {
            id: {
               type: 'integer'
            },

            fieldId: {
               type: 'integer'
            },

            value: {
               type: 'string',
               nullable: true
            },

            storageTypeId: {
               type: 'integer'
            },

            name: {
               type: 'string',
               nullable: true
            },

            type: {
               type: 'string',
               nullable: true
            }
         }
      },

      CreateStorageRequest: {
         type: 'object',

         required: ['name', 'storageTypeId', 'data'],

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            notes: {
               type: 'string',
               nullable: true
            },

            storageTypeId: {
               type: 'integer',
               minimum: 1
            },

            data: {
               type: 'object',

               additionalProperties: {
                  type: 'string'
               }
            }
         }
      },

      UpdateStorageRequest: {
         type: 'object',

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            notes: {
               type: 'string',
               nullable: true
            },

            data: {
               type: 'object',

               additionalProperties: {
                  type: 'string'
               }
            }
         }
      },

      Group: {
         type: 'object',

         properties: {
            id: {
               type: 'integer',
               example: 1
            },

            name: {
               type: 'string',
               example: 'Production'
            },

            size: {
               type: 'number',
               example: 10
            },

            nameMask: {
               type: 'string',
               example: 'prod-*'
            },

            ipMask: {
               type: 'string',
               example: '10.0.0.*'
            },

            bmcUsername: {
               type: 'string',
               example: 'admin'
            },

            bmcPassword: {
               type: 'string',
               example: 'secret'
            },

            bmcIpMask: {
               type: 'string',
               example: '10.0.1.*'
            }
         }
      },

      CreateGroupRequest: {
         type: 'object',

         required: ['name', 'nameMask', 'ipMask', 'bmcUsername', 'bmcPassword', 'bmcIpMask'],

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            size: {
               type: 'number',
               example: 10
            },

            nameMask: {
               type: 'string',
               minLength: 1
            },

            ipMask: {
               type: 'string',
               minLength: 1
            },

            bmcUsername: {
               type: 'string',
               minLength: 1
            },

            bmcPassword: {
               type: 'string',
               minLength: 1
            },

            bmcIpMask: {
               type: 'string',
               minLength: 1
            }
         }
      },

      UpdateGroupRequest: {
         type: 'object',

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            size: {
               type: 'number',
               example: 10
            },

            nameMask: {
               type: 'string',
               minLength: 1
            },

            ipMask: {
               type: 'string',
               minLength: 1
            },

            bmcUsername: {
               type: 'string',
               minLength: 1
            },

            bmcPassword: {
               type: 'string',
               minLength: 1
            },

            bmcIpMask: {
               type: 'string',
               minLength: 1
            }
         }
      },

      AssetType: {
         type: 'object',

         properties: {
            id: {
               type: 'integer'
            },

            name: {
               type: 'string',
               nullable: true
            },

            AssetTypeFields: {
               type: 'array',

               items: {
                  $ref: '#/components/schemas/AssetTypeField'
               }
            }
         }
      },

      AssetTypeField: {
         type: 'object',

         properties: {
            id: {
               type: 'integer'
            },

            name: {
               type: 'string',
               nullable: true
            },

            type: {
               type: 'string',
               nullable: true
            }
         }
      },

      CreateAssetTypeRequest: {
         type: 'object',

         required: ['name', 'fields'],

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            fields: {
               type: 'array',
               minItems: 1,

               items: {
                  $ref: '#/components/schemas/AssetTypeFieldInput'
               }
            }
         }
      },

      AssetTypeFieldInput: {
         type: 'object',

         required: ['name', 'type'],

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            type: {
               type: 'string',
               minLength: 1
            }
         }
      },

      UpdateAssetTypeRequest: {
         type: 'object',

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            fields: {
               type: 'array',

               items: {
                  $ref: '#/components/schemas/AssetTypeFieldInput'
               }
            }
         }
      },

      StorageType: {
         type: 'object',

         properties: {
            id: {
               type: 'integer'
            },

            name: {
               type: 'string',
               nullable: true
            },

            StorageTypeFields: {
               type: 'array',

               items: {
                  $ref: '#/components/schemas/StorageTypeField'
               }
            }
         }
      },

      StorageTypeField: {
         type: 'object',

         properties: {
            id: {
               type: 'integer'
            },

            name: {
               type: 'string',
               nullable: true
            },

            type: {
               type: 'string',
               nullable: true
            }
         }
      },

      CreateStorageTypeRequest: {
         type: 'object',

         required: ['name', 'fields'],

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            fields: {
               type: 'array',
               minItems: 1,

               items: {
                  $ref: '#/components/schemas/StorageTypeFieldInput'
               }
            }
         }
      },

      StorageTypeFieldInput: {
         type: 'object',

         required: ['name', 'type'],

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            type: {
               type: 'string',
               minLength: 1
            }
         }
      },

      UpdateStorageTypeRequest: {
         type: 'object',

         properties: {
            name: {
               type: 'string',
               minLength: 1
            },

            fields: {
               type: 'array',

               items: {
                  $ref: '#/components/schemas/StorageTypeFieldInput'
               }
            }
         }
      },
      IdNamePair: {
         type: 'object',

         properties: {
            nodeName: {
               type: 'string'
            },
            uuid: {
               type: 'string'
            }
         }
      },
      GroupInit: {
         type: 'array',

         items: {
            $ref: '#/components/schemas/IdNamePair'
         }
      }
   } satisfies Record<string, OpenApiSchema>
};
