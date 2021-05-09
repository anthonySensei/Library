export const removedEmptyFields = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => !!v));
