


/// export

export function objectIsEmpty(suppliedObject) {
  if (!suppliedObject)
    return true;

  if (Object.keys(suppliedObject).length === 0)
    return true;

  return false;
}
