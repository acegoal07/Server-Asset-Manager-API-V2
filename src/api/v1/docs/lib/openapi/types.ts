export type OpenApiSchema = {
   type?: string;
   format?: string;
   nullable?: boolean;

   title?: string;
   description?: string;

   default?: unknown;
   example?: unknown;

   minimum?: number;
   maximum?: number;

   minLength?: number;
   maxLength?: number;

   minItems?: number;
   maxItems?: number;

   enum?: unknown[];

   required?: string[];

   properties?: Record<string, OpenApiSchema>;

   items?: OpenApiSchema | OpenApiReference;

   additionalProperties?: boolean | OpenApiSchema;

   $ref?: string;
};

export type OpenApiReference = {
   $ref: string;
};

export type OpenApiExample = {
   summary?: string;
   description?: string;
   value?: unknown;
};

export type OpenApiRequestBody = {
   required?: boolean;
   content: {
      [contentType: string]: {
         schema?: OpenApiSchema | OpenApiReference;
         examples?: Record<string, OpenApiExample>;
      };
   };
};

export type OpenApiOperation = {
   tags?: string[];
   summary?: string;
   description?: string;
   operationId?: string;
   parameters?: unknown[];
   requestBody?: OpenApiRequestBody;
   responses: Record<string, unknown>;
};

export type OpenApiPath = {
   get?: OpenApiOperation;
   post?: OpenApiOperation;
   patch?: OpenApiOperation;
   put?: OpenApiOperation;
   delete?: OpenApiOperation;
};

export type OpenApiDocument = {
   openapi: string;

   info: {
      title: string;
      description?: string;
      version: string;
   };

   servers?: Array<{
      url: string;
   }>;

   tags?: Array<{
      name: string;
      description?: string;
   }>;

   paths: Record<string, OpenApiPath>;

   components: {
      parameters?: Record<string, unknown>;
      schemas: Record<string, OpenApiSchema>;
   };
};
