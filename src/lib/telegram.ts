export const sendTelegramNotification = async (message: string) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8794318752:AAGqr_E9ctKqs17-7NS_uw5znap_kkWYB00';
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '1065019823';

  if (!token || !chatId) {
    console.warn('Telegram Bot Token or Chat ID missing in environment variables.');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('Failed to send Telegram notification:', err);
  }
};

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const notifyProductAdded = async (product: {
  code: string;
  name: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  expiry_dates?: string[];
}) => {
  const expiryStr =
    product.expiry_dates && product.expiry_dates.length > 0
      ? `\n<b>• تواريخ الانتهاء:</b> ${product.expiry_dates.join(', ')}`
      : '';

  const message = `
📦 <b>تم إضافة منتج جديد للمخزن</b>

<b>• اسم المنتج:</b> ${escapeHtml(product.name)}
<b>• الكود:</b> ${escapeHtml(product.code)}
<b>• سعر الشراء:</b> ${product.purchase_price} ج.م
<b>• سعر البيع:</b> ${product.selling_price} ج.م
<b>• الكمية الابتدائيّة:</b> ${product.quantity}${expiryStr}
  `.trim();

  await sendTelegramNotification(message);
};

export const notifyInvoiceCreated = async (invoice: {
  code: string;
  customer_name: string;
  customer_type?: string;
  total_amount: number;
  item_count: number;
  items: { product_name: string; quantity: number; unit_price: number; total: number }[];
  notes?: string;
}) => {
  const itemsText = invoice.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${escapeHtml(item.product_name)}</b> - كمية: ${item.quantity} × ${item.unit_price} = ${item.total} ج.م`
    )
    .join('\n');

  const notesText = invoice.notes ? `\n<b>📝 ملاحظات:</b> ${escapeHtml(invoice.notes)}` : '';
  const customerTypeStr = invoice.customer_type ? ` (${escapeHtml(invoice.customer_type)})` : '';

  const message = `
🧾 <b>تم إنشاء فاتورة جديدة</b>

<b>• رقم الفاتورة:</b> ${escapeHtml(invoice.code)}
<b>• العميل:</b> ${escapeHtml(invoice.customer_name)}${customerTypeStr}
<b>• إجمالي الفاتورة:</b> ${invoice.total_amount.toLocaleString('ar-EG')} ج.م
<b>• عدد القطع:</b> ${invoice.item_count}

<b>📋 أصناف الفاتورة:</b>
${itemsText}${notesText}
  `.trim();

  await sendTelegramNotification(message);
};
