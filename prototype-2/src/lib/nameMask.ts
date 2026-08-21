/**
 * Checks the mask against the node count to make sure the mask supports the size
 * @param mask
 * @param size
 * @returns
 */
export function checkNameMaskForSize(mask: string, size: number): boolean {
   const match = mask.match(/^([^\\[]+)\[(\d+)-(\d+):(\d+)\]([^\]]*)$/);

   if (!match) {
      throw new Error('Invalid name mask. Expected format like arun[1-20:2]');
   }

   const start = Number(match[2]);
   const end = Number(match[3]);

   return size <= end - start + 1;
}

/**
 * Takes in the node index and the node name mask to generate the node name
 * @param mask
 * @param nodeIndex
 * @returns
 */
export function getNodeNameFromMask(mask: string, nodeIndex: number): string {
   const match = mask.match(/^([^\\[]+)\[(\d+)-(\d+):(\d+)\]([^\]]*)$/);

   if (!match) {
      throw new Error('Invalid name mask. Expected format like arun[1-20:2]');
   }

   const start = Number(match[2]);
   const end = Number(match[3]);
   const padding = Number(match[4]);

   if (start > end) {
      throw new Error('Start of range cannot be greater than end');
   }

   if (!Number.isInteger(nodeIndex) || nodeIndex < start || nodeIndex > end) {
      throw new Error(`Node ${nodeIndex} is outside the range ${start} - ${end}`);
   }

   if (!Number.isInteger(padding) || padding < 1) {
      throw new Error('Padding must be a positive integer');
   }

   return `${match[1]}${nodeIndex.toString().padStart(padding, '0')}${match[5]}`;
}

/**
 * Uses the name of the node to calculate the index of the node
 * @param mask
 * @param nodeName
 * @param nodeCount
 * @returns
 */
export function findNodeIndex(mask: string, nodeName: string, nodeCount: number): number {
   for (let i = 0; i < nodeCount; i++) {
      try {
         const generatedName = getNodeNameFromMask(mask, i);

         if (generatedName === nodeName) {
            return i;
         }
      } catch {
         continue;
      }
   }

   return 0;
}
