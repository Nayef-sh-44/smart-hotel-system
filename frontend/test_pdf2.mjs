import { jsPDF } from "jspdf";
import fs from "fs";
import { amiriFont } from "./src/utils/AmiriFont.js";

const doc = new jsPDF();
doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
doc.setFont('Amiri');

doc.text("Hotel Hilton in Dubai (123)!", 105, 20, { align: 'center' });

fs.writeFileSync("test2.pdf", Buffer.from(doc.output('arraybuffer')));
console.log("test2.pdf created.");
