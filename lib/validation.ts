export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ValidationService {
  static validateName(name: string): ValidationResult {
    const errors: string[] = []

    if (!name.trim()) {
      errors.push("Name is required")
    } else if (name.length < 20 || name.length > 60) {
      errors.push("Name must be between 20-60 characters")
    }

    return { isValid: errors.length === 0, errors }
  }

  static validateEmail(email: string): ValidationResult {
    const errors: string[] = []
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      errors.push("Email is required")
    } else if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address")
    }

    return { isValid: errors.length === 0, errors }
  }

  static validatePassword(password: string): ValidationResult {
    const errors: string[] = []

    if (!password) {
      errors.push("Password is required")
    } else {
      if (password.length < 8 || password.length > 16) {
        errors.push("Password must be between 8-16 characters")
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least 1 uppercase letter")
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least 1 special character")
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  static validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
    const errors: string[] = []

    if (!confirmPassword) {
      errors.push("Confirm password is required")
    } else if (password !== confirmPassword) {
      errors.push("Passwords do not match")
    }

    return { isValid: errors.length === 0, errors }
  }

  static validateAddress(address: string): ValidationResult {
    const errors: string[] = []

    if (address && address.length > 400) {
      errors.push("Address must not exceed 400 characters")
    }

    return { isValid: errors.length === 0, errors }
  }
}
