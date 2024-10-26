


/// export

export default (unsortedObject) => {
  if (!unsortedObject)
    return {};

  return Object.keys(unsortedObject).sort().reduce((obj, key) => {
    obj[key] = unsortedObject[key];
    return obj;
  }, {});
}



/// via https://stackoverflow.com/a/31102605
