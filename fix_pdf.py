# -*- coding: utf-8 -*-
import re

with open("frontend/src/components/BenchmarkingView.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_comp = re.search(r'const applyPreset = \(type\) => \{.*?handleApplyFilter\(s, e\);\n  \};', content, re.DOTALL).group(0)

new_comp = old_comp.replace(
    'const applyPreset = (type) => {',
    'const [activePreset, setActivePreset] = useState(null);\n\n  const applyPreset = (type) => {\n    setActivePreset(type === "summer" ? "Summer" : "Winter");'
)

content = content.replace(old_comp, new_comp)

content = content.replace(
    'onChange={e => setStartDate(e.target.value)}',
    'onChange={e => { setStartDate(e.target.value); setActivePreset(null); }}'
)
content = content.replace(
    'onChange={e => setEndDate(e.target.value)}',
    'onChange={e => { setEndDate(e.target.value); setActivePreset(null); }}'
)

old_pdf = re.search(r'const handleExportPDF = \(\) => \{.*?toast\.error\("Failed to generate PDF\."\);\n    \}\n  \};', content, re.DOTALL).group(0)

new_pdf = """const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // 1. REPORT HEADER
      doc.setFontSize(24);
      doc.setTextColor(30, 58, 138); // HotelLink blue
      doc.text("HotelLink", 14, yPos);
      yPos += 10;
      
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Competitor Benchmarking Report", 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`My Hotel: ${myHotel.name}`, 14, yPos);
      yPos += 6;
      doc.text(`Comparison Period:`, 14, yPos);
      yPos += 6;
      doc.text(`  From: ${period?.start_date || 'N/A'}`, 14, yPos);
      yPos += 6;
      doc.text(`  To: ${period?.end_date || 'N/A'}`, 14, yPos);
      yPos += 10;

      // 2. PERIOD / SEASON
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Period / Season", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      yPos += 8;
      doc.text(`Comparison Period: ${period?.start_date || 'N/A'} -> ${period?.end_date || 'N/A'}`, 14, yPos);
      if (activePreset) {
        yPos += 6;
        doc.text(`Season: ${activePreset}`, 14, yPos);
      }
      yPos += 12;

      // 3. PERFORMANCE SUMMARY
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Performance Summary", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      yPos += 8;

      // Average Price
      doc.setFont('helvetica', 'bold');
      doc.text("Average Price", 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      doc.text(`My Hotel: $${myHotel.avg_base_price}`, 14, yPos);
      yPos += 5;
      doc.text(`Market Average: $${marketAverage.avg_base_price}`, 14, yPos);
      yPos += 5;
      const priceDiffStr = differences.price_difference_amount > 0 ? `+$${differences.price_difference_amount}` : `-$${Math.abs(differences.price_difference_amount)}`;
      doc.text(`Difference: ${priceDiffStr}`, 14, yPos);
      yPos += 8;

      // Occupancy Rate
      doc.setFont('helvetica', 'bold');
      doc.text("Occupancy Rate", 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      doc.text(`My Hotel: ${myHotel.occupancy_rate}%`, 14, yPos);
      yPos += 5;
      doc.text(`Market Average: ${marketAverage.avg_occupancy_rate}%`, 14, yPos);
      yPos += 5;
      const occDiffStr = differences.occupancy_difference > 0 ? `+${differences.occupancy_difference}%` : `${differences.occupancy_difference}%`;
      doc.text(`Difference: ${occDiffStr}`, 14, yPos);
      yPos += 8;

      // Guest Rating
      doc.setFont('helvetica', 'bold');
      doc.text("Guest Rating", 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      doc.text(`My Hotel: ${myHotel.avg_guest_rating}`, 14, yPos);
      yPos += 5;
      doc.text(`Market Average: ${marketAverage.avg_guest_rating}`, 14, yPos);
      yPos += 5;
      const ratDiffStr = differences.rating_difference > 0 ? `+${differences.rating_difference}` : `${differences.rating_difference}`;
      doc.text(`Difference: ${ratDiffStr}`, 14, yPos);
      yPos += 12;

      // 4. PERFORMANCE VS MARKET TABLE
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Performance vs Market Table", 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'My Hotel', 'Market Avg', 'Difference']],
        body: [
          ['Average Price', `$${myHotel.avg_base_price}`, `$${marketAverage.avg_base_price}`, `${priceDiffStr} (${differences.price_difference_percentage > 0 ? '+' : ''}${differences.price_difference_percentage}%)`],
          ['Occupancy Rate', `${myHotel.occupancy_rate}%`, `${marketAverage.avg_occupancy_rate}%`, occDiffStr],
          ['Guest Rating', `${myHotel.avg_guest_rating} / 5.0`, `${marketAverage.avg_guest_rating} / 5.0`, ratDiffStr]
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });

      const finalY = doc.lastAutoTable.finalY || yPos + 30;
      
      // 5. PERFORMANCE INSIGHTS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Performance Insights", 14, finalY + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      let insightY = finalY + 24;
      insights.forEach(insight => {
        const splitText = doc.splitTextToSize(`- ${insight}`, 180);
        doc.text(splitText, 14, insightY);
        insightY += (splitText.length * 6) + 4;
      });

      doc.save(`Benchmarking_${myHotel.name.replace(/\s+/g, '_')}.pdf`);
      toast.success("Benchmarking report downloaded.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.");
    }
  };"""

content = content.replace(old_pdf, new_pdf)

with open("frontend/src/components/BenchmarkingView.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("PDF logic patched.")
