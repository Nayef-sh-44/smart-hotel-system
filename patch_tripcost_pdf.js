const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/TripCostCalculator.jsx', 'utf-8');

// Replace html2pdf import with jspdf and autotable
code = code.replace(/import html2pdf from 'html2pdf\.js';/, `import jsPDF from 'jspdf';\nimport 'jspdf-autotable';`);

// Replace handleDownloadPdf with jspdf implementation
const jspdfImpl = `
  const handleDownloadPdf = () => {
    toast.success('Generating Professional PDF Report...');
    const doc = new jsPDF();
    let yPos = 20;

    // TITLE
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // brand-900
    doc.text('SMART HOTEL PRO', 105, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); // brand-600
    doc.text('TRIP REPORT', 105, yPos, { align: 'center' });
    yPos += 15;

    // TRIP INFO
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(\`Trip Name: \${tripPlan.name || 'My Trip'}\`, 14, yPos);
    yPos += 7;
    doc.text(\`Trip Type: \${tripPlan.tripType || 'Standard'}\`, 14, yPos);
    yPos += 7;
    doc.text(\`Total Destinations: \${tripPlan.destinations.length}\`, 14, yPos);
    yPos += 7;
    doc.text(\`Total Nights: \${totalTripNights}\`, 14, yPos);
    yPos += 15;

    // DESTINATIONS
    tripPlan.destinations.forEach((dest, index) => {
      const pricing = pricingResults[dest.id];
      const checkInD = new Date(dest.checkIn);
      const checkOutD = new Date(dest.checkOut);
      const nights = Math.max(1, Math.ceil((checkOutD - checkInD) / (1000 * 60 * 60 * 24)));
      const tripDays = nights + 1;
      
      const avgFood = dest.city?.avg_daily_food_cost ? Number(dest.city.avg_daily_food_cost) : 0;
      const avgTrans = dest.city?.avg_daily_transport_cost ? Number(dest.city.avg_daily_transport_cost) : 0;
      const foodCost = avgFood * dest.guests * tripDays;
      const transCost = avgTrans * dest.guests * tripDays;

      let hotelCost = 0, taxCost = 0, finalHotelTotal = 0;
      if (pricing) {
        hotelCost = pricing.totalPrice;
        taxCost = pricing.taxAmount;
        finalHotelTotal = pricing.finalTotal;
      }

      // Add Page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text(\`Destination \${index + 1}: \${dest.city?.name || 'City'} - \${dest.hotelName}\`, 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(\`Room: \${dest.roomName} (\${dest.rooms} Room(s))\`, 14, yPos);
      doc.text(\`Guests: \${dest.guests}\`, 100, yPos);
      yPos += 6;
      doc.text(\`Check-in: \${dest.checkIn}\`, 14, yPos);
      doc.text(\`Check-out: \${dest.checkOut} (\${nights} Nights)\`, 100, yPos);
      yPos += 10;

      // Night by night table
      if (pricing && pricing.nightlyBreakdown) {
        const tableData = pricing.nightlyBreakdown.map(night => [
          night.date,
          night.dayType,
          night.season,
          symbol + convertFromUSD(night.base_price, userCurrency).toFixed(2),
          night.multiplier + 'x',
          symbol + convertFromUSD(night.final_price, userCurrency).toFixed(2)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Day Type', 'Season', 'Base Rate', 'Dynamic', 'Final Rate']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] },
          styles: { fontSize: 8 },
          margin: { left: 14 }
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      if (pricing && pricing.activeDeal) {
        doc.setTextColor(16, 185, 129); // emerald
        doc.text(\`* Flash Deal Applied: \${pricing.activeDeal.discount_percentage}% OFF\`, 14, yPos);
        yPos += 8;
      }

      doc.setTextColor(0, 0, 0);
      doc.text(\`Hotel Subtotal: \${symbol}\${convertFromUSD(hotelCost, userCurrency).toFixed(2)}\`, 14, yPos);
      yPos += 6;
      doc.text(\`Taxes (3%): \${symbol}\${convertFromUSD(taxCost, userCurrency).toFixed(2)}\`, 14, yPos);
      yPos += 6;
      doc.text(\`Est. Food: \${symbol}\${convertFromUSD(foodCost, userCurrency).toFixed(2)}\`, 14, yPos);
      yPos += 6;
      doc.text(\`Est. Transport: \${symbol}\${convertFromUSD(transCost, userCurrency).toFixed(2)}\`, 14, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(\`Destination Total: \${symbol}\${convertFromUSD(finalHotelTotal + foodCost + transCost, userCurrency).toFixed(2)}\`, 14, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 15;
    });

    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // FINAL TRIP COST
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text('FINAL TRIP COST SUMMARY', 14, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(\`Total Accommodation: \${symbol}\${convertFromUSD(grandTotalHotel, userCurrency).toFixed(2)}\`, 14, yPos);
    yPos += 8;
    doc.text(\`Total Taxes: \${symbol}\${convertFromUSD(grandTotalTax, userCurrency).toFixed(2)}\`, 14, yPos);
    yPos += 8;
    doc.text(\`Total Est. Food: \${symbol}\${convertFromUSD(grandTotalFood, userCurrency).toFixed(2)}\`, 14, yPos);
    yPos += 8;
    doc.text(\`Total Est. Transport: \${symbol}\${convertFromUSD(grandTotalTransport, userCurrency).toFixed(2)}\`, 14, yPos);
    yPos += 12;

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    const grandTotal = grandTotalHotel + grandTotalTax + grandTotalFood + grandTotalTransport;
    doc.text(\`GRAND TOTAL: \${symbol}\${convertFromUSD(grandTotal, userCurrency).toFixed(2)}\`, 14, yPos);
    
    doc.save('SmartHotel_TripReport.pdf');
  };
`;

code = code.replace(/const handleDownloadPdf = \(\) => \{[\s\S]*?html2pdf\(\)\.set\(opt\)\.from\(element\)\.save\(\);\n  \};/, jspdfImpl);

fs.writeFileSync('frontend/src/pages/TripCostCalculator.jsx', code);
console.log('PATCHED TRIP COST PDF');
