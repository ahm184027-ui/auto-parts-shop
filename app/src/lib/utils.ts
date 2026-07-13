import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Builds a wa.me deep link from a Pakistani local/international number (e.g. "03XX-XXXXXXX" -> "923XXXXXXXXX"). */
export function whatsAppLink(phone: string | undefined, message?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  const normalized = digits.startsWith("92") ? digits : digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalized}${query}`;
}
