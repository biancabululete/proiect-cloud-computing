// Validatori partajati intre client si server pentru a avea aceeasi logica.

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Numele trebuie sa aiba minim 2 caractere";
  if (trimmed.length > 60) return "Numele este prea lung (max 60 caractere)";
  if (!/^[\p{L}\s'\-]+$/u.test(trimmed))
    return "Numele poate contine doar litere, spatii, apostrof sau cratima";
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Emailul este obligatoriu";
  if (trimmed.length > 254) return "Emailul este prea lung";
  // Format simplu, dar suficient pentru a respinge erori evidente
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed))
    return "Format email invalid (ex: nume@exemplu.ro)";
  return null;
}

/**
 * Normalizeaza un numar de telefon romanesc:
 * - elimina spatii, cratime, paranteze, slash-uri si punctele
 * - converteste prefixele +40, 0040, 40 la 0 local
 * Returneaza string normalizat (ex: "0712345678") sau null daca e invalid.
 */
export function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s().\-/]/g, "");
  let local = cleaned;
  if (local.startsWith("+40")) local = "0" + local.slice(3);
  else if (local.startsWith("0040")) local = "0" + local.slice(4);
  else if (local.startsWith("40") && local.length === 11) local = "0" + local.slice(2);

  // Numar mobil romanesc: 07 + 8 cifre = 10 cifre total
  if (/^07\d{8}$/.test(local)) return local;
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Numarul de telefon este obligatoriu";
  if (!normalizePhone(phone))
    return "Numar invalid. Foloseste format romanesc: 07xxxxxxxx (10 cifre) sau +407xxxxxxxx";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Parola trebuie sa aiba minim 8 caractere";
  if (password.length > 128) return "Parola este prea lunga (max 128 caractere)";
  if (!/[A-Za-z]/.test(password))
    return "Parola trebuie sa contina cel putin o litera";
  if (!/\d/.test(password)) return "Parola trebuie sa contina cel putin o cifra";
  return null;
}
