export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

/** "Plumbers" → "plumbers", but "HVAC companies" stays as is. */
export function lowerFirst(text: string) {
  return text.replace(/^[A-Z](?=[a-z])/, (c) => c.toLowerCase())
}
