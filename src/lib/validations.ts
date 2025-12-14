import { z } from 'zod'
export const requiredString = (fieldName: string) =>
  z
    .string({ message: `${fieldName} zorunludur` })
    .min(1, `${fieldName} zorunludur`)
    .transform((val) => val.trim())
export const optionalString = z
  .string()
  .optional()
  .transform((val) => val?.trim())
export const dateString = z.string().refine(
  (val) => {
    if (!val) return true
    const date = new Date(val)
    return !isNaN(date.getTime())
  },
  { message: 'Geçerli bir tarih giriniz' }
)
export const personRoleSchema = z.enum(['manager', 'teammate'], {
  message: 'Geçerli bir rol seçiniz',
})
export const meetingFrequencySchema = z.enum(['weekly', 'biweekly', 'monthly', 'quarterly'], {
  message: 'Geçerli bir sıklık seçiniz',
})
export const createPersonSchema = z.object({
  name: requiredString('İsim'),
  role: personRoleSchema,
  meetingFrequencyGoal: meetingFrequencySchema.optional(),
})
export const updatePersonSchema = createPersonSchema.partial()
export type CreatePersonInput = z.infer<typeof createPersonSchema>
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>
export const createMeetingSchema = z.object({
  personId: z.number({ message: 'Kişi seçiniz' }).positive('Kişi seçiniz'),
  templateId: z.number().optional(),
  date: requiredString('Tarih'),
  title: optionalString,
  notes: optionalString,
  talkingPoints: optionalString,
  nextTopics: optionalString,
})
export const updateMeetingSchema = createMeetingSchema.partial()
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>
export const createActionSchema = z.object({
  meetingId: z.number({ message: 'Toplantı seçiniz' }).positive('Toplantı seçiniz'),
  description: requiredString('Açıklama'),
  assignee: optionalString,
  dueDate: optionalString,
  completed: z.boolean().default(false),
})
export const updateActionSchema = createActionSchema.partial()
export type CreateActionInput = z.infer<typeof createActionSchema>
export type UpdateActionInput = z.infer<typeof updateActionSchema>
export const createTemplateSchema = z.object({
  name: requiredString('Şablon adı'),
  description: optionalString,
  content: requiredString('İçerik'),
  isDefault: z.boolean().default(false),
})
export const updateTemplateSchema = createTemplateSchema.partial()
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
export const notificationSettingsSchema = z.object({
  enabled: z.boolean(),
  meetingReminders: z.boolean(),
  actionReminders: z.boolean(),
  reminderHoursBefore: z.number().min(1).max(72),
})
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return { success: false, errors }
}
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return errors
}
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): string | undefined {
  const fieldSchema = z.object({ [fieldName]: schema })
  const result = fieldSchema.safeParse({ [fieldName]: value })
  if (result.success) {
    return undefined
  }
  const fieldError = result.error.issues.find((issue) => issue.path.includes(fieldName))
  return fieldError?.message
}
