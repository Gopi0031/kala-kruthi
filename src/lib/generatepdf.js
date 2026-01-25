import PDFDocument from 'pdfkit';

export async function generatePdf(data, templateType) {
  return new Promise((resolve, reject) => {
    try {
      console.log("📄 Starting PDF generation for:", templateType);
      
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      // Collect PDF chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        console.log("✅ PDF generation complete");
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (err) => {
        console.error("❌ PDF generation error:", err);
        reject(err);
      });

      // Header with golden theme
      doc
        .fontSize(32)
        .fillColor('#D97706')
        .text('Kalakruthi Photography', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(20)
        .fillColor('#92400E')
        .text(templateType, { align: 'center' })
        .moveDown(1);

      // Decorative line
      doc
        .strokeColor('#FCD34D')
        .lineWidth(3)
        .moveTo(100, doc.y)
        .lineTo(495, doc.y)
        .stroke()
        .moveDown(2);

      // Form data
      doc.fontSize(14).fillColor('#1F2937');

      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc
            .fontSize(12)
            .fillColor('#6B7280')
            .text(label + ':', 100, doc.y, { continued: true })
            .fontSize(14)
            .fillColor('#1F2937')
            .text('  ' + value)
            .moveDown(0.5);
        }
      });

      // Footer
      doc.moveDown(3);
      doc
        .strokeColor('#FCD34D')
        .lineWidth(2)
        .moveTo(100, doc.y)
        .lineTo(495, doc.y)
        .stroke()
        .moveDown(1);

      doc
        .fontSize(10)
        .fillColor('#9CA3AF')
        .text('Kalakruthi Photography', { align: 'center' })
        .text('Professional Photography Services', { align: 'center' })
        .moveDown(0.3)
        .text('📞 Contact: +91 XXXXXXXXXX', { align: 'center' })
        .text('📧 Email: info@kalakruthi.com', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      reject(error);
    }
  });
}
