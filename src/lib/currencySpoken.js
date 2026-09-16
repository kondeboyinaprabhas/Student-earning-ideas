// currencySpoken.js - Natural Indian English Currency Pronunciation Engine
// Converts currency values into natural spoken words (e.g. ₹1,50,000 -> "One lakh fifty thousand rupees")

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen"
];

const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
];

function threeDigitsToWords(n) {
  let str = "";
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + " hundred ";
    n %= 100;
  }
  if (n > 0) {
    if (n < 20) {
      str += ONES[n] + " ";
    } else {
      str += TENS[Math.floor(n / 10)] + " ";
      if (n % 10 > 0) {
        str += ONES[n % 10] + " ";
      }
    }
  }
  return str.trim();
}

/**
 * Converts any numeric amount into Indian English numbering system words.
 * Handles crores, lakhs, thousands, hundreds.
 */
export function numberToIndianWords(num) {
  let n = Math.round(Math.abs(num));
  if (n === 0) return "zero";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remainder = n;

  const parts = [];
  if (crore > 0) parts.push(threeDigitsToWords(crore) + " crore");
  if (lakh > 0) parts.push(threeDigitsToWords(lakh) + " lakh");
  if (thousand > 0) parts.push(threeDigitsToWords(thousand) + " thousand");
  if (remainder > 0) parts.push(threeDigitsToWords(remainder));

  return parts.join(" ").trim();
}

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a raw currency string like "₹1,50,000" or "₹20,000 - ₹50,000 / month"
 * into natural spoken words.
 */
export function naturalizeCurrencyInText(text) {
  if (!text || typeof text !== 'string') return text || '';

  // 1. Handle free / zero investment special cases
  let processed = text.replace(/₹\s*0\s*\((?:100%\s*)?free\)/gi, 'zero rupees, completely free');
  processed = processed.replace(/₹\s*0\s*\(zero\)/gi, 'zero rupees');

  // 2. Handle currency ranges: e.g. "₹20,000 - ₹50,000 / month" or "₹500 to ₹2,000"
  processed = processed.replace(
    /₹\s*([0-9,]+)\s*(?:-|–|—|to)\s*₹?\s*([0-9,]+)(\s*(?:\/|per)\s*(?:month|project|sale|day|client|hr|hour))?/gi,
    (match, n1, n2, period) => {
      const num1 = parseInt(n1.replace(/,/g, ''), 10);
      const num2 = parseInt(n2.replace(/,/g, ''), 10);
      const w1 = isNaN(num1) ? n1 : numberToIndianWords(num1);
      const w2 = isNaN(num2) ? n2 : numberToIndianWords(num2);

      let perStr = "";
      if (period) {
        const cleanPeriod = period.replace(/[\/\s]/g, '').toLowerCase();
        if (cleanPeriod.includes('month')) perStr = " per month";
        else if (cleanPeriod.includes('project')) perStr = " per project";
        else if (cleanPeriod.includes('client')) perStr = " per client";
        else if (cleanPeriod.includes('day')) perStr = " per day";
        else if (cleanPeriod.includes('sale')) perStr = " per sale";
        else perStr = " " + period.trim().replace(/^\//, 'per ');
      }

      return `${w1} to ${w2} rupees${perStr}`;
    }
  );

  // 3. Handle standalone currency amounts: e.g. "₹60,000", "₹1,50,000", "₹2,00,000 / month"
  processed = processed.replace(
    /₹\s*([0-9,]+)(\s*(?:\/|per)\s*(?:month|project|sale|day|client|hr|hour))?/gi,
    (match, n, period) => {
      const num = parseInt(n.replace(/,/g, ''), 10);
      if (isNaN(num)) return match;
      const w = numberToIndianWords(num);

      let perStr = "";
      if (period) {
        const cleanPeriod = period.replace(/[\/\s]/g, '').toLowerCase();
        if (cleanPeriod.includes('month')) perStr = " per month";
        else if (cleanPeriod.includes('project')) perStr = " per project";
        else if (cleanPeriod.includes('client')) perStr = " per client";
        else if (cleanPeriod.includes('day')) perStr = " per day";
        else if (cleanPeriod.includes('sale')) perStr = " per sale";
        else perStr = " " + period.trim().replace(/^\//, 'per ');
      }

      return `${w} rupees${perStr}`;
    }
  );

  // 4. Clean up capitalization after sentence periods or beginning
  return processed
    .replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}
