'use client';

export default function ExportToPDF({ filename = 'report' }) {
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          ${reportContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <button
      onClick={exportToPDF}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
      type="button"
    >
      📄 Export to PDF
    </button>
  );
}
