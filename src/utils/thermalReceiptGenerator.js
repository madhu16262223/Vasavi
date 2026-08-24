import { STORE_INFO } from '../data/mockData';

/**
 * Generates and triggers browser print for an 80mm standard retail thermal receipt.
 */
export const printThermalReceipt = (posSale) => {
  if (!posSale) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const printWindow = window.open('', '_blank', 'width=350,height=600');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt #${posSale.receiptNumber || 'POS'}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 76mm;
          margin: 2mm auto;
          padding: 2mm;
          color: #000;
          font-size: 11px;
          line-height: 1.3;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .border-top { border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px; }
        .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
        .double-border { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 4px 0; margin: 6px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 2px 0; font-size: 10.5px; }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="bold" style="font-size: 14px; letter-spacing: 1px;">VASAVI FANCY STORE</div>
        <div style="font-size: 9px;">Cosmetics • Bangles • Jewellery • Bags</div>
        <div style="font-size: 8.5px;">NK Rd, Nadigadda, Telugu peta, Nandyal</div>
        <div style="font-size: 8.5px;">Ph: +91 83099 17665 / 97043 81790</div>
      </div>

      <div class="border-top" style="font-size: 9px; margin-top: 6px;">
        <div><b>Rcpt:</b> #${posSale.receiptNumber || `POS-${Math.floor(1000 + Math.random() * 9000)}`}</div>
        <div><b>Date:</b> ${dateStr} ${timeStr}</div>
        <div><b>Cust:</b> ${posSale.customerName || 'Walk-in Counter Customer'}</div>
      </div>

      <div class="border-top border-bottom" style="margin-top: 4px;">
        <table>
          <thead>
            <tr>
              <th align="left">ITEM</th>
              <th align="center">QTY</th>
              <th align="right">PRICE</th>
              <th align="right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${(posSale.items || []).map(item => `
              <tr>
                <td align="left">${(item.name || 'Item').substring(0, 16)}</td>
                <td align="center">${item.quantity || 1}</td>
                <td align="right">${item.price || 0}</td>
                <td align="right">${(item.price || 0) * (item.quantity || 1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="double-border">
        <table>
          <tr>
            <td><b>TOTAL ITEMS:</b></td>
            <td class="text-right"><b>${(posSale.items || []).reduce((s, i) => s + (i.quantity || 1), 0)}</b></td>
          </tr>
          ${posSale.discount > 0 ? `
          <tr>
            <td>Discount:</td>
            <td class="text-right">-₹${posSale.discount}</td>
          </tr>` : ''}
          <tr style="font-size: 13px;">
            <td><b>NET PAYABLE:</b></td>
            <td class="text-right"><b>₹${posSale.totalAmount}</b></td>
          </tr>
          <tr>
            <td>Payment (${posSale.paymentMethod || 'Cash'}):</td>
            <td class="text-right">₹${posSale.tenderedAmount || posSale.totalAmount}</td>
          </tr>
          ${posSale.changeReturn > 0 ? `
          <tr>
            <td><b>Change Returned:</b></td>
            <td class="text-right"><b>₹${posSale.changeReturn}</b></td>
          </tr>` : ''}
        </table>
      </div>

      <div class="text-center" style="font-size: 9px; margin-top: 8px;">
        <div>*** THANK YOU FOR SHOPPING ***</div>
        <div>VISIT AGAIN • VASAVI FANCY STORE</div>
        <div style="font-size: 7.5px; margin-top: 3px;">GST Inclusive • Nandyal Exclusive</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
