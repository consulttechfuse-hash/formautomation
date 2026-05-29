import { NextResponse } from 'next/server';
import * as pdf from 'html-pdf-node';

export async function POST(request: Request) {
  try {
    const { html, filename } = await request.json();
    
    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }
    
    const options = {
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      printBackground: true
    };
    
    const file = { content: html };
    const pdfBuffer = await pdf.generatePdf(file, options);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'document'}.pdf"`
      }
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
