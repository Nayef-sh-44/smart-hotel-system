import { jsPDF } from "jspdf";
const doc = new jsPDF();

const processMixedText = (text, doc) => {
  if (typeof text !== 'string') return text;
  if (!/[\u0600-\u06FF]/.test(text)) return text;
  
  const tokens = text.split(/([\u0600-\u06FF]+(?:[\s\d.,!؟]+[\u0600-\u06FF]+)*)/u).filter(Boolean);
  
  return tokens.map(token => {
    if (/[\u0600-\u06FF]/.test(token)) {
      return doc.processArabic(token).split('').reverse().join('');
    }
    return token;
  }).join('');
};

console.log(processMixedText("في 123 دبي", doc));
