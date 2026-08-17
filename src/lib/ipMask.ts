function parseOctet(part: string): {
   min: number;
   max: number;
} {
   // * means the full octet range
   if (part === '*') {
      return {
         min: 0,
         max: 255
      };
   }

   const rangeMatch = part.match(/^\[(\d+)-(\d+)\]$/);

   if (rangeMatch) {
      const min = Number(rangeMatch[1]);
      const max = Number(rangeMatch[2]);

      if (min < 0 || max > 255 || min > max) {
         throw new Error(`Invalid P range: ${part}`);
      }

      return {
         min,
         max
      };
   }

   // Otherwise it should be one fixed octet
   const value = Number(part);

   if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error(`Invalid P octet: ${part}`);
   }

   return {
      min: value,
      max: value
   };
}

export function checkIpMaskForSize(mask: string, size: number): boolean {
   const parts = mask.split('.');

   if (parts.length !== 4) {
      throw new Error('IP mask must contain exactly four octets');
   }

   const ranges = parts.map(parseOctet);

   const totalAddresses = ranges.reduce((total, range) => total * (range.max - range.min + 1), 1);

   return totalAddresses >= size;
}

export function getIpFromMask(mask: string, nodeNumber: number): string {
   if (!Number.isInteger(nodeNumber) || nodeNumber < 1) {
      throw new Error('Node number must be a positive integer');
   }

   const parts = mask.split('.');

   if (parts.length !== 4) {
      throw new Error('IP mask must contain exactly four octets');
   }

   const ranges = parts.map(parseOctet);

   const totalAddresses = ranges.reduce((total, range) => total * (range.max - range.min + 1), 1);

   if (nodeNumber > totalAddresses) {
      throw new Error(
         `Node ${nodeNumber} is outside this mask. ` + `Mask contains ${totalAddresses} addresses.`
      );
   }
   let index = nodeNumber - 1;

   const octets = new Array<number>(4);

   for (let i = 3; i >= 0; i--) {
      const range = ranges[i];

      const rangeSize = range.max - range.min + 1;

      const positionInRange = index % rangeSize;

      octets[i] = range.min + positionInRange;

      index = Math.floor(index / rangeSize);
   }

   return octets.join('.');
}
