import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, '이메일을 입력해주세요')
  .email('올바른 이메일 형식이 아니에요')

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 해요')
  .max(72, '비밀번호가 너무 길어요')

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type Credentials = z.infer<typeof credentialsSchema>
