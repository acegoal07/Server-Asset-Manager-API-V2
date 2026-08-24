import { NodeVM } from 'vm2';

import { dataField } from './dataFieldHelpers';
import { prisma } from './prisma';

/**
 * Gets the domain information
 * @param id
 * @returns
 */
async function getDomainData(id: number): Promise<object | null> {
   const initialDomain = await prisma.domains.findUnique({
      where: {
         id
      },
      include: {
         PrimaryGenders: {
            include: {
               Nodes: true,
               GenderHierarchy: {
                  include: {
                     SubGenders: true
                  }
               }
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
               Nodes: Object.fromEntries(item.Nodes.map((node) => [node.name, node])) ?? [],
               SubGenders: Object.fromEntries(
                  item.GenderHierarchy.map((sub) => [
                     sub.SubGenders.name,
                     { ...sub.SubGenders, priority: sub.priority }
                  ])
               )
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
function renderEta(template: string, data: object): string {
   const vm = new NodeVM({
      console: 'off',
      timeout: 1000,
      allowAsync: false,
      sandbox: {
         template,
         data
      },
      require: {
         external: {
            modules: ['eta'],
            transitive: false
         }
      }
   });
   return vm.run(
      `const { Eta } = require('eta');const eta = new Eta();module.exports = eta.renderString(template, data);`,
      'eta-render.js'
   );
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

   return Object.fromEntries(
      Object.entries(dataFields).map(([key, field]) => {
         if (field.type !== 'eta' || !field.value) {
            return [key, field];
         }

         try {
            return [
               key,
               {
                  ...field,
                  value: renderEta(field.value, domainInfo),
                  raw: field.value
               }
            ];
         } catch (error) {
            console.log(error);
            return [key, field];
         }
      })
   );
}
