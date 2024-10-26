


/// export

export default (originalArray: Array<number | string>, elementToRemove: any): any[] => {
  const arr: Array<number | string> = originalArray.filter(item => item !== elementToRemove);
  return arr;
};



/// via https://stackoverflow.com/a/21688894
/// removeFromArray([1, 2, 1, 0, 3, 1, 4], 1);
