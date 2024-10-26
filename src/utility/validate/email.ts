


/// export

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/;
export default (email: string): boolean => emailRegex.test(email);
