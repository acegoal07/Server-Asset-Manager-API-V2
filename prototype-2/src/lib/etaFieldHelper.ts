import { Eta } from 'eta';
import ivm from 'isolated-vm';

import { dataField } from './dataFieldHelpers';
import { prisma } from './prisma';

async function getDomainData(id: number): Promise<object | null> {
   // Get all initial domain information
   const initialDomain = await prisma.domains.findUnique({
      where: {
         id
      },
      include: {
         PrimaryGenders: {
            include: {
               Nodes: true
            }
         },
         SubGenders: true
      }
   });

   return {
      ...initialDomain,
      PrimaryGenders: Object.fromEntries(
         initialDomain?.PrimaryGenders.map((item) => [
            item.name,
            {
               ...item,
               Nodes: Object.fromEntries(item.Nodes.map((node) => [node.name, node])) ?? []
            }
         ]) ?? []
      ),
      SubGenders: Object.fromEntries(
         initialDomain?.SubGenders.map((item) => [item.name, item]) ?? []
      )
   };
}

/**
 * Runs the eta render in an isolated environment to prevent unauthorised access
 * @param template 
 * @param data 
 * @param eta 
 * @returns 
 */
async function renderEta(template: string, data: object, eta: Eta) {
   const isolate = new ivm.Isolate({
      memoryLimit: 32
   });

   try {
      const context = await isolate.createContext();

      const global = context.global;

      context.global.set('eta', eta);

      await global.set('domainInfo', new ivm.ExternalCopy(data).copyInto());
      await global.set('template', new ivm.ExternalCopy(template).copyInto());

      const script = await isolate.compileScript(`
         eta.renderString(template, domainInfo);
      `);

      return await script.run(context, {
         timeout: 100
      });
   } finally {
      isolate.dispose();
   }
}

/**
 * Takes in the data fields and renders any that are eta strings
 * @param dataFields
 * @param domainId
 * @returns
 */
export async function checkDataFieldForETA(
   dataFields: Record<string, dataField>,
   domainId: number
): Promise<Record<string, dataField>> {
   const domainInfo = await getDomainData(domainId);

   if (!domainInfo) {
      return Object.fromEntries(
         Object.entries(dataFields).map(([key, field]) => {
            return [key, field];
         })
      );
   }

   const eta = new Eta();

   return Object.fromEntries(
      await Promise.all(
         Object.entries(dataFields).map(async ([key, field]) => {
            if (
               field.type !== 'eta' ||
               !field.value
            ) {
               return [key, field];
            }

            try {
               return [
                  key,
                  {
                     ...field,
                     value: await renderEta(field.value, domainInfo, eta),
                     raw: field.value
                  }
               ];
            } catch {
               return [key, field];
            }
         })
      )
   );

}
