export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Alphanumeric and underscores, 3-20 characters
  return usernameRegex.test(username);
}

export function validateCode(code: string): boolean {
  const codeRegex = /^\d{4}$/; // 4-digit number
  return codeRegex.test(code);
}
