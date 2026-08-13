export function getNodeNameFromMask(mask: string, nodeNumber: number): string {
   const match = mask.match(/^([^\\[]+)\[(\d+)-(\d+):(\d+)\]([^\]]*)$/);

   if (!match) {
      throw new Error('Invalid name mask. Expected format like arun[1-20:2]');
   }

   const prefix = match[1];
   const start = Number(match[2]);
   const end = Number(match[3]);
   const padding = Number(match[4]);
   const suffix = match[5];

   if (start > end) {
      throw new Error('Start of range cannot be greater than end');
   }

   if (!Number.isInteger(nodeNumber) || nodeNumber < start || nodeNumber > end) {
      throw new Error(`Node ${nodeNumber} is outside the range ${start} - ${end}`);
   }

   if (!Number.isInteger(padding) || padding < 1) {
      throw new Error('Padding must be a positive integer');
   }

   const paddedNumber = nodeNumber.toString().padStart(padding, '0');

   return `${prefix}${paddedNumber}${suffix}`;
}
