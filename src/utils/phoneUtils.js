/**
 * Centralized, null-safe phone and formatting utilities for Vasavi Fancy Store.
 * Guaranteed never to throw uncaught ReferenceError or TypeError on unexpected inputs.
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Normalizes any phone input into a standard 10-digit Indian mobile number.
 * Safely strips +91, 91 prefix, leading 0, spaces, parentheses, dashes.
 * @param {string|number|null|undefined} phoneInput 
 * @returns {string} 10-digit clean string or empty string
 */
export const cleanIndianPhone = (phoneInput) => {
  if (phoneInput === null || phoneInput === undefined) return '';
  try {
    let str = String(phoneInput).trim().replace(/\D/g, '');
    if (str.startsWith('91') && str.length === 12) {
      str = str.slice(2);
    } else if (str.startsWith('0') && str.length === 11) {
      str = str.slice(1);
    }
    return str;
  } catch {
    return '';
  }
};

/**
 * Validates whether a given phone number is a valid 10-digit Indian mobile number (starts with 6, 7, 8, 9).
 * @param {string|number|null|undefined} phoneInput 
 * @returns {boolean}
 */
export const isValidIndianPhone = (phoneInput) => {
  const cleaned = cleanIndianPhone(phoneInput);
  return PHONE_REGEX.test(cleaned);
};

/**
 * Formats a 10-digit phone for human display: +91 83099 17665
 * @param {string|number|null|undefined} phoneInput 
 * @returns {string}
 */
export const formatDisplayPhone = (phoneInput) => {
  const cleaned = cleanIndianPhone(phoneInput);
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phoneInput ? String(phoneInput) : '';
};

/**
 * Robust date formatter guaranteed never to throw on invalid dates.
 * @param {string|Date|number|null|undefined} dateInput 
 * @returns {string}
 */
export const formatFullDateTime = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = hours.toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
  } catch {
    return String(dateInput || '');
  }
};
