import { normalizeText } from "@/lib/appointmentParser";

export function suggestProduct(serviceName, products, aliases) {
  const normalizedName = normalizeText(serviceName);
  const product = products.find((item) => normalizeText(item.name) === normalizedName);
  if (product) return { product_id: product.id, match_type: "normalized", confidence: 1 };
  const alias = aliases.find((item) => item.normalized_alias === normalizedName);
  if (alias) return { product_id: alias.product_id, match_type: "alias", confidence: 1 };
  return { product_id: null, match_type: "unidentified", confidence: null };
}

export function reviewIssues(data, items) {
  const issues = [];
  if (!data.client?.name?.trim()) issues.push({ field: "cliente.nome", message: "Informe o nome do cliente." });
  if (!data.event?.date) issues.push({ field: "evento.data", message: "Informe a data do evento." });
  if (!data.event?.address?.trim()) issues.push({ field: "evento.endereco", message: "Informe o endereço do evento." });
  if (!items.length) issues.push({ field: "servicos", message: "Informe ao menos um serviço." });
  if (items.some((item) => !item.product_id)) issues.push({ field: "servicos", message: "Vincule todos os serviços a um produto antes de confirmar." });
  if (items.some((item) => !Number.isInteger(Number(item.quantity || 1)) || Number(item.quantity || 1) < 1)) {
    issues.push({ field: "servicos.quantidade", message: "Informe uma quantidade válida para cada serviço." });
  }
  if (data.event?.start_time && data.event?.end_time && data.event.end_time <= data.event.start_time) {
    issues.push({ field: "evento.horario", message: "O horário final deve ser posterior ao horário inicial." });
  }
  if (data.total_amount !== null && data.total_amount !== undefined && Number(data.total_amount) < 0) {
    issues.push({ field: "valor", message: "O valor total não pode ser negativo." });
  }
  return issues.map((issue) => {
    if (issue.field === "servicos") {
      return {
        ...issue,
        field: "produtos",
        message: issue.message.startsWith("Vincule")
          ? "Vincule todos os itens aos produtos do catalogo antes de confirmar."
          : "Informe ao menos um produto.",
      };
    }
    if (issue.field === "servicos.quantidade") {
      return {
        ...issue,
        field: "produtos.quantidade",
        message: "Informe uma quantidade valida para cada produto.",
      };
    }
    return issue;
  });
}
