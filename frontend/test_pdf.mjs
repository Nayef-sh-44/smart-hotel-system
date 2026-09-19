import { jsPDF } from "jspdf";
import fs from "fs";
import { amiriFont } from "./src/utils/AmiriFont.js";

const doc = new jsPDF();
doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
doc.setFont('Amiri');

const text = "HotelLink: تطبيق هوتَل لينك لتنظيم عروض الفنادق و الرحلات";

doc.text(doc.processArabic(text), 105, 20, { align: 'center' });
doc.text(text, 105, 40, { align: 'center' });

fs.writeFileSync("test.pdf", Buffer.from(doc.output('arraybuffer')));
console.log("test.pdf created.");
