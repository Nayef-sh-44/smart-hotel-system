import { jsPDF } from 'jspdf';
const doc = new jsPDF();
const res = doc.processArabic('Hotel Hilton في دبي');
console.log(Array.from(res).map(c => c.charCodeAt(0).toString(16)).join(' '));
