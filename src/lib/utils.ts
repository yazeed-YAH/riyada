import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// تحويل الأرقام العربية إلى إنجليزية
export function toEnglishNumbers(input: string | number): string {
  if (input === null || input === undefined) return ''
  
  const str = String(input)
  
  // الأرقام العربية (٠١٢٣٤٥٦٧٨٩) إلى إنجليزية
  const arabicNumerals: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  }
  
  // الأرقام الفارسية/الشرقية (۰۱۲۳۴۵۶۷۸۹) إلى إنجليزية
  const easternNumerals: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  }
  
  return str
    .split('')
    .map(char => arabicNumerals[char] ?? easternNumerals[char] ?? char)
    .join('')
}
