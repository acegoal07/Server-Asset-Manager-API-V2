import type { OpenApiPath } from './types';

export const openApiPaths: Record<string, OpenApiPath> = {
   '/assets': {
      get: {
         tags: ['Assets'],
         summary: 'Get all assets',
         operationId: 'getAssets',

         parameters: [
            {
               name: 'typeId',
               in: 'query',
               required: false,
               description: 'Filter assets by asset type ID',
               schema: {
                  type: 'integer',
                  minimum: 1
               },
               example: 1
            },
            {
               name: 'type',
               in: 'query',
               required: false,
               description: 'Filter assets by asset type name',
               schema: {
                  type: 'string'
               },
               example: 'Server'
            }
         ],

         responses: {
            '200': {
               description: 'Assets retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        type: 'array',
                        items: {
                           $ref: '#/components/schemas/Asset'
                        }
                     }
                  }
               }
            }
         }
      },

      post: {
         tags: ['Assets'],
         summary: 'Create an asset',
         operationId: 'createAsset',

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/CreateAssetRequest'
                  }
               }
            }
         },

         responses: {
            '201': {
               description: 'Asset created successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Asset'
                     }
                  }
               }
            },

            '400': {
               description: 'Invalid asset data'
            },

            '404': {
               description: 'Asset type not found'
            }
         }
      }
   },

   '/assets/{id}': {
      get: {
         tags: ['Assets'],
         summary: 'Get an asset by ID',
         operationId: 'getAssetById',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         responses: {
            '200': {
               description: 'Asset retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Asset'
                     }
                  }
               }
            },

            '404': {
               description: 'Asset not found'
            }
         }
      },

      patch: {
         tags: ['Assets'],
         summary: 'Update an asset',
         operationId: 'updateAsset',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/UpdateAssetRequest'
                  }
               }
            }
         },

         responses: {
            '200': {
               description: 'Asset updated successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Asset'
                     }
                  }
               }
            },

            '404': {
               description: 'Asset not found'
            }
         }
      }
   },

   '/storages': {
      get: {
         tags: ['Storages'],
         summary: 'Get all storages',
         operationId: 'getStorages',

         parameters: [
            {
               name: 'typeId',
               in: 'query',
               required: false,
               description: 'Filter storages by storage type ID',
               schema: {
                  type: 'integer',
                  minimum: 1
               },
               example: 1
            },
            {
               name: 'type',
               in: 'query',
               required: false,
               description: 'Filter storages by storage type name',
               schema: {
                  type: 'string'
               },
               example: 'Rack'
            }
         ],

         responses: {
            '200': {
               description: 'Storages retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        type: 'array',
                        items: {
                           $ref: '#/components/schemas/Storage'
                        }
                     }
                  }
               }
            }
         }
      },

      post: {
         tags: ['Storages'],
         summary: 'Create a storage',
         operationId: 'createStorage',

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/CreateStorageRequest'
                  }
               }
            }
         },

         responses: {
            '201': {
               description: 'Storage created successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Storage'
                     }
                  }
               }
            },

            '400': {
               description: 'Invalid storage data'
            },

            '404': {
               description: 'Storage type not found'
            }
         }
      }
   },

   '/storages/{id}': {
      get: {
         tags: ['Storages'],
         summary: 'Get a storage by ID',
         operationId: 'getStorageById',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         responses: {
            '200': {
               description: 'Storage retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Storage'
                     }
                  }
               }
            },

            '404': {
               description: 'Storage not found'
            }
         }
      },

      patch: {
         tags: ['Storages'],
         summary: 'Update a storage',
         operationId: 'updateStorage',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/UpdateStorageRequest'
                  }
               }
            }
         },

         responses: {
            '200': {
               description: 'Storage updated successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Storage'
                     }
                  }
               }
            },

            '404': {
               description: 'Storage not found'
            }
         }
      }
   },

   '/groups': {
      get: {
         tags: ['Groups'],
         summary: 'Get all groups',
         operationId: 'getGroups',

         responses: {
            '200': {
               description: 'Groups retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        type: 'array',
                        items: {
                           $ref: '#/components/schemas/Group'
                        }
                     }
                  }
               }
            }
         }
      },

      post: {
         tags: ['Groups'],
         summary: 'Create a group',
         operationId: 'createGroup',

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/CreateGroupRequest'
                  }
               }
            }
         },

         responses: {
            '201': {
               description: 'Group created successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Group'
                     }
                  }
               }
            },

            '400': {
               description: 'Invalid group data'
            }
         }
      }
   },

   '/groups/{id}': {
      get: {
         tags: ['Groups'],
         summary: 'Get a group by ID',
         operationId: 'getGroupById',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         responses: {
            '200': {
               description: 'Group retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Group'
                     }
                  }
               }
            },

            '404': {
               description: 'Group not found'
            }
         }
      },

      patch: {
         tags: ['Groups'],
         summary: 'Update a group',
         operationId: 'updateGroup',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/UpdateGroupRequest'
                  }
               }
            }
         },

         responses: {
            '200': {
               description: 'Group updated successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/Group'
                     }
                  }
               }
            },

            '404': {
               description: 'Group not found'
            }
         }
      }
   },
   '/groups/{id}/initialize': {
      post: {
         tags: ['Groups'],
         summary: 'Assign UUIDs to node names',
         operationId: 'initializeGroup',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/GroupInit'
                  }
               }
            }
         },

         responses: {
            '201': {
               description: 'Created'
            },
            '404': {
               description: 'Group not found'
            }
         }
      }
   },

   '/groups/{id}/extend': {
      post: {
         tags: ['Groups'],
         summary: 'Create more notes in a group',
         operationId: 'extendGroup',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/GroupInit'
                  }
               }
            }
         },

         responses: {
            '201': {
               description: 'Created'
            },
            '404': {
               description: 'Group not found'
            }
         }
      }
   },

   '/types/assets': {
      get: {
         tags: ['Types'],
         summary: 'Get all asset types',
         operationId: 'getAssetTypes',

         responses: {
            '200': {
               description: 'Asset types retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        type: 'array',
                        items: {
                           $ref: '#/components/schemas/AssetType'
                        }
                     }
                  }
               }
            }
         }
      },

      post: {
         tags: ['Types'],
         summary: 'Create an asset type',
         operationId: 'createAssetType',

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/CreateAssetTypeRequest'
                  }
               }
            }
         },

         responses: {
            '201': {
               description: 'Asset type created successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/AssetType'
                     }
                  }
               }
            }
         }
      }
   },

   '/types/assets/{id}': {
      get: {
         tags: ['Types'],
         summary: 'Get an asset type by ID',
         operationId: 'getAssetTypeById',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         responses: {
            '200': {
               description: 'Asset type retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/AssetType'
                     }
                  }
               }
            },

            '404': {
               description: 'Asset type not found'
            }
         }
      },

      patch: {
         tags: ['Types'],
         summary: 'Update an asset type',
         operationId: 'updateAssetType',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/UpdateAssetTypeRequest'
                  }
               }
            }
         },

         responses: {
            '200': {
               description: 'Asset type updated successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/AssetType'
                     }
                  }
               }
            }
         }
      }
   },

   '/types/storages': {
      get: {
         tags: ['Types'],
         summary: 'Get all storage types',
         operationId: 'getStorageTypes',

         responses: {
            '200': {
               description: 'Storage types retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        type: 'array',
                        items: {
                           $ref: '#/components/schemas/StorageType'
                        }
                     }
                  }
               }
            }
         }
      },

      post: {
         tags: ['Types'],
         summary: 'Create a storage type',
         operationId: 'createStorageType',

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/CreateStorageTypeRequest'
                  }
               }
            }
         },

         responses: {
            '201': {
               description: 'Storage type created successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/StorageType'
                     }
                  }
               }
            }
         }
      }
   },

   '/types/storages/{id}': {
      get: {
         tags: ['Types'],
         summary: 'Get a storage type by ID',
         operationId: 'getStorageTypeById',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         responses: {
            '200': {
               description: 'Storage type retrieved successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/StorageType'
                     }
                  }
               }
            },

            '404': {
               description: 'Storage type not found'
            }
         }
      },

      patch: {
         tags: ['Types'],
         summary: 'Update a storage type',
         operationId: 'updateStorageType',

         parameters: [
            {
               $ref: '#/components/parameters/Id'
            }
         ],

         requestBody: {
            required: true,

            content: {
               'application/json': {
                  schema: {
                     $ref: '#/components/schemas/UpdateStorageTypeRequest'
                  }
               }
            }
         },

         responses: {
            '200': {
               description: 'Storage type updated successfully',

               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/StorageType'
                     }
                  }
               }
            }
         }
      }
   }
};
