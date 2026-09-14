import type { Role } from './auth'

export const canManageProducts = (role: Role) => role === 'admin' || role === 'manager'
export const canDeleteProducts = (role: Role) => role === 'admin'
export const canManageSettings = (role: Role) => role === 'admin'
export const canUsePOS = (_role: Role) => true
