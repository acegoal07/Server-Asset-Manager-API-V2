import { Eta } from 'eta';

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
 * Takes in the data fields and renders any that are eta strings
 * @param dataFields
 * @param domainId
 * @returns
 */
export async function checkDataFieldForETA(
   dataFields: Record<string, dataField>,
   domainId: number
): Promise<Record<string, dataField>> {
   const eta = new Eta();

   const domainInfo = await getDomainData(domainId);

   if (!domainInfo) {
      return Object.fromEntries(
         Object.entries(dataFields).map(([key, field]) => {
            return [key, field];
         })
      );
   }

   return Object.fromEntries(
      Object.entries(dataFields).map(([key, field]) => {
         if (
            field.type !== 'eta' ||
            !field.value ||
            field.value.toLowerCase().includes('process.env')
         ) {
            return [key, field];
         }

         try {
            return [
               key,
               {
                  ...field,
                  value: eta.renderString(field.value, domainInfo),
                  raw: field.value
               }
            ];
         } catch {
            return [key, field];
         }
      })
   );
}
