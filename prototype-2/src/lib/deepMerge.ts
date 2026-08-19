import merge from 'deepmerge';

/**
 * Datafield type
 */
type NamedItem = {
   id: number;
   dataId: number;
   name: string;
   identifier: string;
   type: string;
   value: string | null;
   deletable: boolean;
};

/**
 * Deep merges arrays by names returning a single array
 * @param arrays
 * @returns
 */
export function deepMergeByName(arrays: NamedItem[][]): NamedItem[] {
   const mergeByName = (target: NamedItem[], source: NamedItem[]): NamedItem[] => {
      return source.reduce<NamedItem[]>(
         (result, sourceItem) => {
            const index = result.findIndex(
               (targetItem) => targetItem.identifier === sourceItem.identifier
            );

            if (index === -1) {
               result.push(sourceItem);
            } else {
               result[index] = merge(result[index], sourceItem, {
                  arrayMerge: mergeByName
               }) as NamedItem;
            }

            return result;
         },
         [...target]
      );
   };

   return merge.all(arrays, {
      arrayMerge: mergeByName
   }) as NamedItem[];
}
