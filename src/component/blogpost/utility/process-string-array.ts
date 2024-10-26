


/// export

export default (input: unknown): string[] => {
  if (!Array.isArray(input))
    return [];

  const validPattern = /^[a-zA-Z0-9\-_]+$/;

  return input
    .filter((item): item is string => typeof item === "string")
    .filter(item => item.length > 0 && validPattern.test(item));
}
