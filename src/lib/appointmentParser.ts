function clean(value) {
  return value.replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();
}

export function normalizeText(value) {
  return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function label(lines, names) {
  const expression = new RegExp(`^(?:${names.join("|")})$`, "i");
  for (const line of lines) {
    const value = clean(line);
    const separator = value.indexOf(":");
    if (separator < 0) continue;
    if (expression.test(normalizeText(value.slice(0, separator)))) return clean(value.slice(separator + 1)) || null;
  }
  return null;
}

function date(value) {
  const match = value?.match(/(\d{1,2})\s*[/-]\s*(\d{1,2})\s*[/-]\s*(\d{2,4})/);
  if (!match) return null;
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const result = new Date(Date.UTC(year, Number(match[2]) - 1, Number(match[1])));
  if (result.getUTCFullYear() !== year || result.getUTCMonth() !== Number(match[2]) - 1 || result.getUTCDate() !== Number(match[1])) return null;
  return `${year}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[1])).padStart(2, "0")}`;
}

function times(value) {
  const values = [...(value || "").matchAll(/\b([01]?\d|2[0-3])(?:\s*(?:h|:|hs)\s*(\d{1,2}))?\s*h?\b/gi)].map((match) => {
    const minute = match[2] === undefined ? 0 : Number(match[2]);
    return minute <= 59 ? `${String(Number(match[1])).padStart(2, "0")}:${String(minute).padStart(2, "0")}` : null;
  }).filter(Boolean);
  return { start: values[0] || null, end: values[1] || null };
}

function amount(value) {
  const match = value?.match(/(?:R\$\s*)?([\d.]+(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)/i);
  if (!match) return null;
  const parsed = Number(match[1].includes(",") ? match[1].replace(/\./g, "").replace(",", ".") : match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function services(lines) {
  const start = lines.findIndex((line) => /^(?:servicos?|produtos?|itens)(?:\s+(?:do|da)\s+(?:festa|reserva|mensagem|evento))?\s*:\s*(?:.*)?$/i.test(normalizeText(clean(line))));
  if (start < 0) return [];
  const found = [];
  for (const line of lines.slice(start + 1)) {
    const normalized = normalizeText(line);
    if (!line.trim() || /^[-—_]{3,}$/.test(line.trim()) || normalized.includes("valor:") || normalized.includes("monteiro locacoes")) break;
    const originalName = clean(line.replace(/^\s*(?:[-•]|\*\s*)+/, ""));
    if (originalName) found.push({ original_name: originalName, normalized_name: normalizeText(originalName) });
  }
  return found;
}

export function parseAppointmentMessage(originalText) {
  const lines = originalText.replace(/\r/g, "").split("\n");
  const fieldLines = lines.map(clean);
  const documentNumber = label(fieldLines, ["cpf\\s*\\/?\\s*cnpj", "cpf", "cnpj"])?.replace(/\D/g, "") || null;
  const phone = label(fieldLines, ["telefone", "celular", "fone"])?.replace(/\D/g, "") || null;
  const dateValue = date(label(fieldLines, ["data"]));
  const timeValue = times(label(fieldLines, ["hor[aá]rio(?:\\s*\\([^)]*\\))?"]));
  const result = {
    client: { name: label(fieldLines, ["nome"]), document_number: documentNumber, phone },
    event: { date: dateValue, address: label(fieldLines, ["endere[cç]o"]), venue_type: label(fieldLines, ["local(?:\\s*\\([^)]*\\))?"]), start_time: timeValue.start, end_time: timeValue.end },
    services: services(lines),
    total_amount: amount(label(fieldLines, ["valor(?:\\s+total)?"])),
    issues: [],
  };
  if (!result.client.name) result.issues.push({ field: "cliente.nome", message: "Nome do cliente não encontrado." });
  if (!result.event.date) result.issues.push({ field: "evento.data", message: "Data válida do evento não encontrada." });
  if (!result.event.address) result.issues.push({ field: "evento.endereco", message: "Endereço do evento não encontrado." });
  if (!result.services.length) result.issues.push({ field: "servicos", message: "Nenhum serviço foi identificado." });
  if (documentNumber && ![11, 14].includes(documentNumber.length)) result.issues.push({ field: "cliente.documento", message: "CPF/CNPJ precisa ter 11 ou 14 números." });
  if (phone && ![10, 11].includes(phone.length)) result.issues.push({ field: "cliente.telefone", message: "Telefone precisa ter 10 ou 11 números." });
  return result;
}

export async function hashAppointmentMessage(message) {
  const bytes = new TextEncoder().encode(message.trim());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
}
