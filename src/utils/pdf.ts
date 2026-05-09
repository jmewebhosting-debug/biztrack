import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Sale } from '../types';
import { format } from 'date-fns';

export const generateInvoice = (sale: Sale) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241); // Primary color
  doc.text('BUSINESS INVOICE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice Date: ${format(new Date(), 'dd MMM yyyy')}`, 105, 28, { align: 'center' });

  // Company / Seller Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('SELLER DETAILS', 14, 45);
  doc.setFontSize(10);
  doc.text('Your Business Name', 14, 52);
  doc.text('Email: your@email.com', 14, 57);

  // Customer Info
  doc.setFontSize(12);
  doc.text('BILL TO', 140, 45);
  doc.setFontSize(10);
  doc.text(sale.customerName, 140, 52);

  // Table
  autoTable(doc, {
    startY: 70,
    head: [['Description', 'Category', 'Quantity', 'Amount']],
    body: [
      [sale.productName, sale.category, '1', `INR ${sale.price.toLocaleString()}`],
    ],
    headStyles: { fillColor: [99, 102, 241] },
    theme: 'grid',
  });

  // Footer / Totals
  const finalY = (doc as any).lastAutoTable.finalY || 80;
  doc.setFontSize(12);
  doc.text(`TOTAL AMOUNT: INR ${sale.price.toLocaleString()}`, 140, finalY + 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Renewal Date: ${format(new Date(sale.renewalDate), 'dd MMM yyyy')}`, 14, finalY + 20);
  
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  doc.save(`Invoice_${sale.customerName.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
