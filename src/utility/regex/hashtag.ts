


/// export

export const hashtagRegex = /#[\p{L}\p{N}_]+/gu;

export default (text: string): string[] => {
  const matches = text.match(hashtagRegex);
  return matches ? matches : [];
}
