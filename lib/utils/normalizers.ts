// Normalize text: capitalizes first letter, lowercases the rest
export function normalizeText(value: string): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (trimmed.length === 0) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

// Normalize email: trim and lowercase
export function normalizeEmail(value: string): string {
  if (!value) return ''
  return value.trim().toLowerCase()
}

// Generate all variants for a field
export function generateVariants(fieldName: string, value: string): Record<string, string> {
  const normalized = normalizeText(value)
  return {
    [fieldName]: normalized,
    [`${fieldName}_upper`]: normalized.toUpperCase(),
    [`${fieldName}_lower`]: normalized.toLowerCase(),
    [`${fieldName}_capital`]: normalized,
  }
}

// Apply normalization to all form fields
export function normalizeFormData(data: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (key.includes('email')) {
      result[key] = normalizeEmail(value)
    } else if (key.includes('name') || key.includes('surname') || key.includes('first') || key.includes('last')) {
      result[key] = normalizeText(value)
    } else {
      result[key] = value?.trim() || ''
    }
  }
  
  return result
}
