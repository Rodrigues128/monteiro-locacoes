type QuotePdfItem = {
  description: string;
  quantity: number;
  unitAmount: number;
};

type QuotePdfCompany = {
  tradeName?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
};

type QuotePdfCustomer = {
  name?: string | null;
  phone?: string | null;
  documentNumber?: string | null;
};

type QuotePdfData = {
  title: string;
  eventDate?: string | null;
  validUntil?: string | null;
  totalAmount: number;
  notes?: string | null;
  customer?: QuotePdfCustomer | null;
  items: QuotePdfItem[];
};

function escapeHtml(value?: string | null) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatDate(value?: string | null) {
  if (!value) return "A definir";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

export function renderQuotePdf(
  printWindow: Window,
  quote: QuotePdfData,
  company: QuotePdfCompany,
) {
  const companyName = company.tradeName || "Monteiro Locações";
  const companyContact = [company.phone || company.whatsapp, company.email]
    .filter(Boolean)
    .join(" · ");
  const companyAddress = [company.address, company.city, company.state]
    .filter(Boolean)
    .join(" · ");
  const clientDetails = [quote.customer?.phone, quote.customer?.documentNumber]
    .filter(Boolean)
    .join(" · ");
  const itemRows = quote.items.length
    ? quote.items
        .map(
          (item) => `<tr>
            <td>${escapeHtml(item.description)}</td>
            <td class="numeric">${item.quantity}</td>
            <td class="numeric">${formatMoney(item.unitAmount)}</td>
            <td class="numeric">${formatMoney(item.quantity * item.unitAmount)}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="empty">Itens serão definidos com a equipe Monteiro Locações.</td></tr>`;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Orçamento - ${escapeHtml(quote.title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #edf4f7; color: #0b1e38; font-family: Arial, Helvetica, sans-serif; }
          main { width: 210mm; min-height: 297mm; margin: 16px auto; background: #fff; padding: 18mm; box-shadow: 0 18px 48px rgba(15, 35, 55, .14); }
          .brand { display: flex; align-items: start; justify-content: space-between; gap: 24px; border-bottom: 3px solid #00bfff; padding-bottom: 20px; }
          .eyebrow { margin: 0; color: #008fc0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
          h1 { margin: 8px 0 0; font-size: 32px; letter-spacing: -1px; }
          .company { max-width: 270px; text-align: right; color: #52657d; font-size: 12px; line-height: 1.65; }
          .company strong { display: block; color: #0b1e38; font-size: 15px; }
          .label { margin: 28px 0 8px; color: #008fc0; font-size: 11px; font-weight: 700; letter-spacing: 1.7px; text-transform: uppercase; }
          .quote-title { margin: 0; font-size: 22px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
          .info { border: 1px solid #dce7ee; border-radius: 12px; padding: 13px; background: #f8fbfd; }
          .info span { display: block; color: #7890a7; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
          .info strong { display: block; margin-top: 6px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { padding: 11px 10px; background: #07152b; color: #fff; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: .8px; }
          td { border-bottom: 1px solid #e5edf2; padding: 13px 10px; font-size: 13px; }
          .numeric { text-align: right; white-space: nowrap; }
          .empty { color: #7890a7; font-style: italic; text-align: center; }
          .total { display: flex; justify-content: flex-end; align-items: center; gap: 20px; margin-top: 22px; padding: 16px 18px; border-radius: 13px; background: #e9faff; }
          .total span { color: #008fc0; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
          .total strong { font-size: 24px; }
          .notes { margin-top: 22px; border-left: 3px solid #00bfff; background: #f8fbfd; padding: 14px 16px; color: #52657d; font-size: 13px; line-height: 1.55; white-space: pre-wrap; }
          footer { position: fixed; bottom: 12mm; left: 18mm; right: 18mm; border-top: 1px solid #dce7ee; padding-top: 10px; color: #7890a7; font-size: 10px; }
          .print { position: fixed; right: 24px; top: 24px; border: 0; border-radius: 10px; background: #07152b; color: #fff; cursor: pointer; font-weight: 700; padding: 12px 16px; }
          @page { size: A4; margin: 0; }
          @media print { body { background: #fff; } main { margin: 0; box-shadow: none; } .print { display: none; } }
        </style>
      </head>
      <body>
        <button class="print" onclick="window.print()">Salvar / imprimir PDF</button>
        <main>
          <header class="brand">
            <div>
              <p class="eyebrow">Proposta comercial</p>
              <h1>Orçamento</h1>
            </div>
            <div class="company">
              <strong>${escapeHtml(companyName)}</strong>
              ${company.documentNumber ? `<div>CNPJ: ${escapeHtml(company.documentNumber)}</div>` : ""}
              ${companyContact ? `<div>${escapeHtml(companyContact)}</div>` : ""}
              ${companyAddress ? `<div>${escapeHtml(companyAddress)}</div>` : ""}
            </div>
          </header>
          <p class="label">Proposta</p>
          <h2 class="quote-title">${escapeHtml(quote.title)}</h2>
          <section class="info-grid">
            <div class="info"><span>Cliente</span><strong>${escapeHtml(quote.customer?.name || "Cliente a definir")}</strong>${clientDetails ? `<small>${escapeHtml(clientDetails)}</small>` : ""}</div>
            <div class="info"><span>Data do evento</span><strong>${formatDate(quote.eventDate)}</strong></div>
            <div class="info"><span>Válido até</span><strong>${formatDate(quote.validUntil)}</strong></div>
            <div class="info"><span>Emitido em</span><strong>${formatDate(new Date().toISOString())}</strong></div>
          </section>
          <table>
            <thead><tr><th>Produto ou serviço</th><th class="numeric">Qtd.</th><th class="numeric">Valor unit.</th><th class="numeric">Subtotal</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div class="total"><span>Valor total</span><strong>${formatMoney(quote.totalAmount)}</strong></div>
          ${quote.notes ? `<section class="notes"><strong>Observações</strong><br />${escapeHtml(quote.notes)}</section>` : ""}
          <footer>Este orçamento é uma proposta comercial e está sujeito à disponibilidade na data solicitada.</footer>
        </main>
      </body>
    </html>`);
  printWindow.document.close();
  printWindow.focus();
}

export type { QuotePdfCompany, QuotePdfCustomer, QuotePdfData, QuotePdfItem };
