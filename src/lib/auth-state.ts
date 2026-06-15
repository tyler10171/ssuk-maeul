export type AuthActionState = {
  error: string | null
  fieldErrors?: Partial<Record<'email' | 'password', string>>
}

export const initialAuthState: AuthActionState = { error: null }
