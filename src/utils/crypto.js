const encoder = new TextEncoder()

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return arrayBufferToHex(bytes)
}

export async function hashPassword(password, salt) {
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return arrayBufferToHex(hashBuffer)
}

export async function verifyPassword(password, storedHash, salt) {
  const hash = await hashPassword(password, salt)
  return hash === storedHash
}

export function createSalt() {
  return generateSalt()
}
