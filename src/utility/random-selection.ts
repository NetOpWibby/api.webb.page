


/// export

export default (sourceArray: string[], neededElements: number): string[] => {
  const arraySize = sourceArray.length;
  const result = [];

  for (let i = 0; i < neededElements; i++) {
    result.push(sourceArray[Math.floor(Math.random() * arraySize)]);
  }

  return [...new Set(result)];
}
