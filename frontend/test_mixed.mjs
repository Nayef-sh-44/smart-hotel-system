import { jsPDF } from "jspdf";
const doc = new jsPDF();

const processMixedText = (text, doc) => {
  if (typeof text !== 'string') return text;
  if (!/[\u0600-\u06FF]/.test(text)) return text;
  
  // Match Arabic blocks including internal spaces, numbers, and basic punctuation
  const tokens = text.split(/([\u0600-\u06FF]+(?:[\s\d.,!؟]+[\u0600-\u06FF]+)*)/u).filter(Boolean);
  
  return tokens.map(token => {
    if (/[\u0600-\u06FF]/.test(token)) {
      return doc.processArabic(token).split('').reverse().join('');
    }
    return token;
  }).join('');
};

const texts = [
  "HotelLink: تطبيق هوتَل لينك لتنظيم عروض الفنادق و الرحلات",
  "Hotel Hilton في دبي 123!",
  "فندق هيلتون (Hilton)",
];

texts.forEach(t => {
  console.log("Original:", t);
  const shaped = processMixedText(t, doc);
  console.log("Processed Hex:", Array.from(shaped).map(c => c.charCodeAt(0).toString(16)).join(' '));
  console.log("---");
});
