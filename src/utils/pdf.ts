import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Sale, BusinessSettings } from '../types';
import { format } from 'date-fns';
import { db } from '../db/db';

export const generateInvoice = async (sale: Sale) => {
  const doc = new jsPDF();
  const settings = await db.settings.toCollection().first() || {
    businessName: 'Your Business',
    email: 'business@example.com',
    phone: '+91 00000 00000',
    address: 'Business Address'
  };

  // Header
  doc.setFontSize(24);
  doc.setTextColor(99, 102, 241); // Primary color
  doc.text(settings.businessName.toUpperCase(), 105, 20, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(settings.address, 105, 26, { align: 'center' });
  doc.text(`Email: ${settings.email} | Phone: ${settings.phone}`, 105, 31, { align: 'center' });

  doc.setDrawColor(230);
  doc.line(14, 38, 196, 38);

  // Invoice Meta
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE TO:', 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.customerName, 14, 56);
  
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE DETAILS:', 140, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${format(new Date(sale.date), 'dd MMM yyyy')}`, 140, 56);
  doc.text(`Invoice #: INV-${sale.id || 'TEMP'}`, 140, 61);

  // Table Data
  const tableBody = sale.items && sale.items.length > 0 
    ? sale.items.map(item => [item.name, item.category, '1', `INR ${item.price.toLocaleString()}`])
    : [[sale.productName, sale.category, '1', `INR ${sale.price.toLocaleString()}`]];

  // Table
  autoTable(doc, {
    startY: 75,
    head: [['Description', 'Category', 'Qty', 'Price']],
    body: tableBody,
    headStyles: { fillColor: [99, 102, 241], fontSize: 10, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
    },
    theme: 'striped',
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;
  
  // Calculations
  const amountPaid = sale.amountPaid || sale.price;
  const due = sale.price - amountPaid;

  // Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBTOTAL:', 140, finalY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`INR ${sale.price.toLocaleString()}`, 196, finalY + 15, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('AMOUNT PAID:', 140, finalY + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(`INR ${amountPaid.toLocaleString()}`, 196, finalY + 22, { align: 'right' });

  if (due > 0) {
    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.text('BALANCE DUE:', 140, finalY + 29);
    doc.text(`INR ${due.toLocaleString()}`, 196, finalY + 29, { align: 'right' });
    doc.setTextColor(0);
  }

  // Footer Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RENEWAL DATE:', 14, finalY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(sale.renewalDate), 'dd MMM yyyy'), 14, finalY + 21);

  if (sale.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', 14, finalY + 35);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(sale.notes, 14, finalY + 41, { maxWidth: 100 });
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Thank you for choosing our services!', 105, 285, { align: 'center' });

  doc.save(`Invoice_${sale.customerName.replace(/\s/g, '_')}_${format(new Date(sale.date), 'yyyyMMdd')}.pdf`);
};
