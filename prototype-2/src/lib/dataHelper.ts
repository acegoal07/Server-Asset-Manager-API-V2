export function convertFromDataBase(data: object) {
   return {
      ...data!,
      Data: {
         ...data.Data,
         DataFields: Object.fromEntries(
            data.Data.DataFields.map((field) => [field.identifier, field.value])
         )
      }
   };
}
