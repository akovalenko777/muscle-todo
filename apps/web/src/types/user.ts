export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface RegisterValues {
  email: string
  name: string
  password: string
  password_repeat: string
}