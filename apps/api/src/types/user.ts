export type TRole = 'USER' | 'ADMIN'

export interface IUser {
  id: string
  email: string
  role: TRole
  authProvider?: 'local' | 'google'
}