import { jsPDF } from 'jspdf';
import { STORE_INFO } from '../data/mockData';

/**
 * 1. Download Real Monthly Sales CSV
 */
export const downloadMonthlySalesCSV = (orders = [], offlineSales = []) => {
  const headers = [
    'Transaction Type',
    'Record ID',
    'Date & Time',
    'Customer Name',
    'Phone',
    'Address',
    'Items Summary',
    'Total Amount (INR)',
    'Payment Method',
    'Payment Status',
    'Order Status'
  ];

  const rows = [];

  // Add Online Supabase Orders
  orders.forEach((o) => {
    const itemsStr = (o.items || []).map(i => `${i.productName} (x${i.quantity})`).join('; ') || 'Direct Product';
    const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : '';
    rows.push([
      'ONLINE ORDER',
      `"${o.orderNumber || o.id}"`,
      `"${dateStr}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${(o.customerAddress || o.address || '').replace(/"/g, '""')}"`,
      `"${itemsStr.replace(/"/g, '""')}"`,
      o.totalAmount || 0,
      `"${o.paymentMethod || 'WHATSAPP'}"`,
      `"${o.paymentStatus || 'UNPAID'}"`,
      `"${o.status || 'PENDING'}"`
    ]);
  });

  // Add Offline Sales
  offlineSales.forEach((s) => {
    const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN') : '';
    rows.push([
      'OFFLINE COUNTER',
      `"${s.id}"`,
      `"${dateStr}"`,
      `"${(s.customerName || 'Walk-in Customer').replace(/"/g, '""')}"`,
      `"-"`,
      `"Vasavi Fancy Store Counter, Nandyal"`,
      `"${(s.notes || 'Counter Direct Sale').replace(/"/g, '""')}"`,
      s.amount || 0,
      `"${s.paymentMethod || 'Cash'}"`,
      `"PAID"`,
      `"COMPLETED"`
    ]);
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const filename = `Vasavi_Sales_Report_${monthNames[now.getMonth()]}_${now.getFullYear()}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 2. Download Official GST Audit Ledger PDF
 */
export const downloadGSTLedgerPDF = (orders = [], offlineSales = [], storeSettings = {}) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const filename = `Vasavi_GST_Audit_Ledger_${now.getMonth() + 1}_${now.getFullYear()}.pdf`;

    // Header Background
    doc.setFillColor(23, 23, 23); // #171717
    doc.rect(0, 0, 210, 40, 'F');

    // Store Title & GST Subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(201, 150, 50); // Gold #c99632
    doc.text('VASAVI FANCY STORE', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL GST SALES AUDIT LEDGER & REVENUE STATEMENT', 14, 23);

    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Audit Period: ${currentMonthYear} | Generated: ${now.toLocaleString('en-IN')}`, 14, 30);
    doc.text(`Location: NK Rd, Nadigadda, Telugu peta, Nandyal, AP - 518501`, 14, 35);

    // Business Summary Box
    doc.setFillColor(250, 248, 245);
    doc.rect(14, 46, 182, 32, 'F');
    doc.setDrawColor(201, 150, 50);
    doc.rect(14, 46, 182, 32, 'S');

    const totalOnlineRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalOfflineRevenue = offlineSales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const grossTotalRevenue = totalOnlineRevenue + totalOfflineRevenue;

    // Approximate Composition/GST breakdown (18% inclusive assumption or composition rate)
    const netTaxableValue = Math.round(grossTotalRevenue / 1.05); // 5% GST composition
    const totalGST = grossTotalRevenue - netTaxableValue;
    const cgst = Math.round(totalGST / 2);
    const sgst = totalGST - cgst;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(23, 23, 23);
    doc.text('FINANCIAL SUMMARY OVERVIEW', 20, 54);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);

    doc.text(`Total Online Orders: ${orders.length} (Rs. ${totalOnlineRevenue.toLocaleString('en-IN')})`, 20, 61);
    doc.text(`Total Counter Sales: ${offlineSales.length} (Rs. ${totalOfflineRevenue.toLocaleString('en-IN')})`, 20, 67);
    doc.text(`Gross Turnover: Rs. ${grossTotalRevenue.toLocaleString('en-IN')}`, 20, 73);

    doc.text(`Taxable Supply: Rs. ${netTaxableValue.toLocaleString('en-IN')}`, 110, 61);
    doc.text(`CGST (2.5%): Rs. ${cgst.toLocaleString('en-IN')}`, 110, 67);
    doc.text(`SGST (2.5%): Rs. ${sgst.toLocaleString('en-IN')}`, 110, 73);

    // Table Header
    doc.setFillColor(201, 150, 50);
    doc.rect(14, 84, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Date', 18, 89);
    doc.text('Invoice / Ref ID', 45, 89);
    doc.text('Customer Name', 85, 89);
    doc.text('Payment', 135, 89);
    doc.text('Amount (INR)', 170, 89);

    // Table Rows
    let y = 97;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);

    const allRecords = [
      ...orders.map(o => ({
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'Recent',
        ref: o.orderNumber || o.id,
        customer: o.customerName || 'Customer',
        payment: `${o.paymentMethod || 'WHATSAPP'} (${o.paymentStatus || 'UNPAID'})`,
        amount: o.totalAmount || 0
      })),
      ...offlineSales.map(s => ({
        date: s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : 'Recent',
        ref: s.id,
        customer: s.customerName || 'Counter Customer',
        payment: `${s.paymentMethod || 'Cash'} (PAID)`,
        amount: s.amount || 0
      }))
    ].slice(0, 22); // Show top 22 records on page 1

    if (allRecords.length === 0) {
      doc.setTextColor(120, 120, 120);
      doc.text('No transaction records found for the selected period.', 70, 105);
    } else {
      allRecords.forEach((rec, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(250, 248, 245);
          doc.rect(14, y - 4, 182, 6, 'F');
        }

        doc.text(String(rec.date), 18, y);
        doc.text(String(rec.ref).substring(0, 18), 45, y);
        doc.text(String(rec.customer).substring(0, 22), 85, y);
        doc.text(String(rec.payment).substring(0, 18), 135, y);
        doc.text(`Rs. ${Number(rec.amount).toLocaleString('en-IN')}`, 170, y);
        y += 6.5;
      });
    }

    // Official Verification Signature Footer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(23, 23, 23);
    doc.text('AUTHORIZED SIGNATORY / STORE MANAGER', 130, 265);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('M. Ramcharan (Proprietor, Vasavi Fancy Store)', 130, 270);
    doc.text('This is an authenticated computer-generated GST tax statement.', 14, 280);

    doc.save(filename);
  } catch (err) {
    console.error('Error generating GST Audit PDF:', err);
  }
};
