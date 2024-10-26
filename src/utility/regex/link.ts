


/// export

export default (providedString: string): boolean => {
  return new RegExp(/(^https?:\/\/.*?)(\S+)|(^https?:\/\/.*?)$/, "i").test(providedString);
};
