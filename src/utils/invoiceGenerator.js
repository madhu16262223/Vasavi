import { jsPDF } from 'jspdf';
import { STORE_INFO } from '../data/mockData';

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF();

  // Background Header Bar
  doc.setFillColor(11, 11, 13); // Midnight Black #0B0B0D
  doc.rect(0, 0, 210, 38, 'F');

  // Title & Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55); // Royal Gold #D4AF37
  doc.text('VASAVI FANCY STORE', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(244, 143, 177); // Pink accent #F48FB1
  doc.text('Cosmetics • Temple Jewellery • Handbags', 14, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE / RECEIPT', 145, 20);

  // Store Address Subtitle
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`${STORE_INFO.address}`, 14, 32);

  // Invoice & Customer Info Box
  let y = 48;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 35, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);

  doc.text(`Order Number: #${order.orderNumber}`, 20, y + 10);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 120, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${order.customerName}`, 20, y + 18);
  doc.text(`Phone: ${order.customerPhone}`, 120, y + 18);

  doc.text(`Delivery Address: ${order.customerAddress}`, 20, y + 26);

  // Table Headers
  y += 45;
  doc.setFillColor(212, 175, 55);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 11, 13);

  doc.text('Item Description', 18, y + 5.5);
  doc.text('Qty', 118, y + 5.5);
  doc.text('Unit Price', 140, y + 5.5);
  doc.text('Amount', 172, y + 5.5);

  // Table Rows
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  let totalCalculated = 0;

  order.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 8, 'F');
    }

    doc.text(item.productName.length > 50 ? item.productName.substring(0, 47) + '...' : item.productName, 18, y + 5.5);
    doc.text(`${item.quantity}`, 120, y + 5.5);
    doc.text(`Rs. ${item.price}`, 140, y + 5.5);
    doc.text(`Rs. ${item.subtotal}`, 172, y + 5.5);

    totalCalculated += item.subtotal;
    y += 8;
  });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, 196, y + 2);

  // Totals Breakdown
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);

  doc.text('Grand Total:', 130, y);
  doc.setTextColor(212, 175, 55);
  doc.text(`Rs. ${order.totalAmount}`, 172, y);

  // Footer Note
  y += 20;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Thank you for shopping at Vasavi Fancy Store! ✨', 20, y + 8);
  doc.text(`For order tracking & customer support, message us on WhatsApp: ${STORE_INFO.displayPhone}`, 20, y + 14);

  // Save File
  doc.save(`Vasavi_Invoice_${order.orderNumber}.pdf`);
};
