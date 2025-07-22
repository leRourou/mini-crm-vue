/**
 * Reusable validation composable following DRY principle
 * Contains common validation rules used across forms
 */

export interface ValidationRule {
  (value: unknown): boolean | string
}

export function useValidation() {
  
  const rules = {
    required: (value: unknown): boolean | string => {
      if (value === null || value === undefined) return 'This field is required'
      if (typeof value === 'string' && value.trim() === '') return 'This field is required'
      if (Array.isArray(value) && value.length === 0) return 'This field is required'
      return true
    },

    email: (value: string): boolean | string => {
      if (!value) return true 
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return pattern.test(value) || 'Please enter a valid email address'
    },

    phone: (value: string): boolean | string => {
      if (!value) return true 
      const pattern = /^[\d\s\-\+\(\)]+$/
      return pattern.test(value) || 'Please enter a valid phone number'
    },

    url: (value: string): boolean | string => {
      if (!value) return true 
      try {
        new URL(value)
        return true
      } catch {
        return 'Please enter a valid URL'
      }
    },

    minLength: (min: number) => (value: string): boolean | string => {
      if (!value) return true 
      return value.length >= min || `Minimum ${min} characters required`
    },

    maxLength: (max: number) => (value: string): boolean | string => {
      if (!value) return true 
      return value.length <= max || `Maximum ${max} characters allowed`
    },

    numeric: (value: unknown): boolean | string => {
      if (!value && value !== 0) return true 
      const num = Number(value)
      return !isNaN(num) || 'Please enter a valid number'
    },

    positiveNumber: (value: unknown): boolean | string => {
      if (!value && value !== 0) return true 
      const num = Number(value)
      if (isNaN(num)) return 'Please enter a valid number'
      return num > 0 || 'Please enter a positive number'
    },

    date: (value: string): boolean | string => {
      if (!value) return true 
      const date = new Date(value)
      return !isNaN(date.getTime()) || 'Please enter a valid date'
    },

    futureDate: (value: string): boolean | string => {
      if (!value) return true 
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0) 
      return date >= today || 'Date must be today or in the future'
    },

    pastDate: (value: string): boolean | string => {
      if (!value) return true 
      const date = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999) 
      return date <= today || 'Date must be today or in the past'
    }
  }

  /**
   * Combine multiple validation rules
   */
  const combine = (...rules: ValidationRule[]): ValidationRule => {
    return (value: unknown): boolean | string => {
      for (const rule of rules) {
        const result = rule(value)
        if (result !== true) return result
      }
      return true
    }
  }

  /**
   * Create conditional validation rule
   */
  const when = (
    condition: () => boolean,
    rule: ValidationRule
  ): ValidationRule => {
    return (value: unknown): boolean | string => {
      if (!condition()) return true
      return rule(value)
    }
  }

  /**
   * Validate form data against a schema
   */
  const validateForm = (
    data: Record<string, unknown>,
    schema: Record<string, ValidationRule[]>
  ): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}
    let isValid = true

    for (const [field, fieldRules] of Object.entries(schema)) {
      const value = data[field]
      
      for (const rule of fieldRules) {
        const result = rule(value)
        if (result !== true) {
          errors[field] = result
          isValid = false
          break 
        }
      }
    }

    return { isValid, errors }
  }

  return {
    rules,
    combine,
    when,
    validateForm
  }
}


export const commonRules = {
  requiredEmail: () => {
    const { rules, combine } = useValidation()
    return [combine(rules.required, rules.email)]
  },
  
  requiredPhone: () => {
    const { rules, combine } = useValidation()
    return [combine(rules.required, rules.phone)]
  },
  
  requiredText: (minLength?: number, maxLength?: number) => {
    const { rules, combine } = useValidation()
    const validationRules = [rules.required]
    if (minLength) validationRules.push(rules.minLength(minLength))
    if (maxLength) validationRules.push(rules.maxLength(maxLength))
    return [combine(...validationRules)]
  },
  
  optionalEmail: () => {
    const { rules } = useValidation()
    return [rules.email]
  },
  
  optionalPhone: () => {
    const { rules } = useValidation()
    return [rules.phone]
  },
  
  requiredPositiveNumber: () => {
    const { rules, combine } = useValidation()
    return [combine(rules.required, rules.positiveNumber)]
  },
  
  requiredFutureDate: () => {
    const { rules, combine } = useValidation()
    return [combine(rules.required, rules.date, rules.futureDate)]
  }
}