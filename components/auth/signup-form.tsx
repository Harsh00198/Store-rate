"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { ValidationService } from "@/lib/validation"
import { CheckCircle, XCircle } from "lucide-react"

interface SignupFormProps {
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    role: "user" as "user" | "store_owner",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (formData.password) {
      const passwordValidation = ValidationService.validatePassword(formData.password)
      setPasswordValid(passwordValidation.isValid)
    } else {
      setPasswordValid(null)
    }

    if (formData.password && formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword)
    } else {
      setPasswordsMatch(null)
    }
  }, [formData.password, formData.confirmPassword])

  const validateForm = () => {
    const validationErrors: string[] = []

    const nameValidation = ValidationService.validateName(formData.name)
    const emailValidation = ValidationService.validateEmail(formData.email)
    const passwordValidation = ValidationService.validatePassword(formData.password)
    const confirmPasswordValidation = ValidationService.validateConfirmPassword(
      formData.password,
      formData.confirmPassword,
    )
    const addressValidation = ValidationService.validateAddress(formData.address)

    validationErrors.push(
      ...nameValidation.errors,
      ...emailValidation.errors,
      ...passwordValidation.errors,
      ...confirmPasswordValidation.errors,
      ...addressValidation.errors,
    )

    return validationErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsLoading(true)

    console.log("[v0] Form submission started")

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      console.log("[v0] Validation errors found", validationErrors)
      setErrors(validationErrors)
      setIsLoading(false)
      return
    }

    console.log("[v0] Validation passed, calling signup")
    const result = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      address: formData.address || undefined,
      role: formData.role,
    })

    console.log("[v0] Signup result", result)

    if (result.success) {
      console.log("[v0] Signup successful, calling onSuccess")
      onSuccess?.()
    } else {
      console.log("[v0] Signup failed with error", result.error)
      setErrors([result.error || "Signup failed"])
    }

    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (errors.length > 0) {
      setErrors([])
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRoleChange = (value: "user" | "store_owner") => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name (20-60 characters)</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              minLength={20}
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password (8-16 chars, 1 uppercase, 1 special)</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                minLength={8}
                maxLength={16}
                className={
                  passwordValid === false ? "border-red-500" : passwordValid === true ? "border-green-500" : ""
                }
              />
              {passwordValid !== null && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {passwordValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                minLength={8}
                maxLength={16}
                className={
                  passwordsMatch === false ? "border-red-500" : passwordsMatch === true ? "border-green-500" : ""
                }
              />
              {passwordsMatch !== null && formData.confirmPassword && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {passwordsMatch ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {formData.confirmPassword && passwordsMatch === false && (
              <p className="text-sm text-red-500">Passwords do not match</p>
            )}
            {formData.confirmPassword && passwordsMatch === true && (
              <p className="text-sm text-green-500">Passwords match</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (optional, max 400 characters)</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              maxLength={400}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Customer</SelectItem>
                <SelectItem value="store_owner">Store Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
