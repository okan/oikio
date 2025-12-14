import { useState, useCallback, useMemo } from 'react'
type ValidationRule<T> = (value: T[keyof T], values: T) => string | undefined
type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>[]>>
interface UseFormOptions<T> {
  initialValues: T
  validationRules?: ValidationRules<T>
  onSubmit?: (values: T) => Promise<void> | void
}
interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
  setValues: (values: Partial<T>) => void
  setError: (field: keyof T, error: string) => void
  clearError: (field: keyof T) => void
  clearErrors: () => void
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (field: keyof T) => () => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  reset: (newValues?: T) => void
  validate: () => boolean
  validateField: (field: keyof T) => string | undefined
}
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues)
  }, [values, initialValues])
  const validateField = useCallback(
    (field: keyof T): string | undefined => {
      const rules = validationRules[field]
      if (!rules) return undefined
      for (const rule of rules) {
        const error = rule(values[field], values)
        if (error) return error
      }
      return undefined
    },
    [values, validationRules]
  )
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true
    for (const field of Object.keys(validationRules) as Array<keyof T>) {
      const error = validateField(field)
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    }
    setErrors(newErrors)
    return isValid
  }, [validateField, validationRules])
  const isValid = useMemo(() => {
    for (const field of Object.keys(validationRules) as Array<keyof T>) {
      const error = validateField(field)
      if (error) return false
    }
    return true
  }, [validateField, validationRules])
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }))
  }, [])
  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])
  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])
  const handleChange = useCallback(
    (field: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { value, type } = e.target
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        setValue(field, newValue as T[keyof T])
      },
    [setValue]
  )
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const error = validateField(field)
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }))
      }
    },
    [validateField]
  )
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      )
      setTouched(allTouched)
      if (!validate()) return
      if (onSubmit) {
        setIsSubmitting(true)
        try {
          await onSubmit(values)
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [values, validate, onSubmit]
  )
  const reset = useCallback(
    (newValues?: T) => {
      setValuesState(newValues ?? initialValues)
      setErrors({})
      setTouched({})
      setIsSubmitting(false)
    },
    [initialValues]
  )
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate,
    validateField,
  }
}
export const validationRules = {
  required: (message = 'This field is required') =>
    (value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return message
      }
      return undefined
    },
  minLength: (min: number, message?: string) =>
    (value: unknown) => {
      if (typeof value === 'string' && value.length < min) {
        return message ?? `Minimum ${min} characters required`
      }
      return undefined
    },
  maxLength: (max: number, message?: string) =>
    (value: unknown) => {
      if (typeof value === 'string' && value.length > max) {
        return message ?? `Maximum ${max} characters allowed`
      }
      return undefined
    },
  email: (message = 'Invalid email address') =>
    (value: unknown) => {
      if (typeof value === 'string' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return message
      }
      return undefined
    },
  pattern: (regex: RegExp, message: string) =>
    (value: unknown) => {
      if (typeof value === 'string' && value && !regex.test(value)) {
        return message
      }
      return undefined
    },
}
