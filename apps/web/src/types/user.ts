export interface User {
  id: string;
  email: string;
  name: string;
  authProvider: 'local' | 'google';
  role: 'USER' | 'ADMIN';
}

export interface RegisterValues {
  email: string
  name: string
  password: string
  password_repeat: string
}