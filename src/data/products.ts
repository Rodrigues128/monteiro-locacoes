/**
 * @typedef {{
 *   id: number,
 *   name: string,
 *   category: string,
 *   age: string,
 *   size: string,
 *   wet: boolean,
 *   capacity: string,
 *   price: number | null,
 *   image: string,
 *   description: string,
 *   features: string[]
 * }} Product
 */

/** @type {Product[]} */
export const products = [
  { id: 1, name: "Tobogã Aventura", category: "Infláveis", age: "4+", size: "8 × 4 m", wet: true, capacity: "8 crianças", price: 550, image: "/images/real/toboga-real.jpeg", description: "Uma atração de grande impacto para transformar a festa em uma aventura inesquecível.", features: ["Estrutura inflável reforçada", "Escada de acesso com degraus", "Piscina de amortecimento", "Montagem e desmontagem inclusas"] },
  { id: 2, name: "Pula-Pula Premium", category: "Brinquedos", age: "3+", size: "4,3 × 4,3 m", wet: false, capacity: "6 crianças", price: 180, image: "/images/real/pula-pula-real.jpeg", description: "Estrutura profissional com rede de proteção e montagem completa no local.", features: ["Rede de proteção total", "Lona de alta resistência", "Capacidade para 6 crianças", "Montagem inclusa"] },
  { id: 3, name: "Piscina de Bolinhas", category: "Brinquedos", age: "2+", size: "3 × 3 m", wet: false, capacity: "8 crianças", price: 220, image: "/images/real/piscina-bolinhas-real.jpeg", description: "Diversão segura para os pequenos, com cores vibrantes e acabamento impecável.", features: ["Bolinhas coloridas", "Estrutura protegida por rede", "Ideal para crianças pequenas", "Higienização completa"] },
  { id: 4, name: "Estação Algodão Doce", category: "Doces", age: "Livre", size: "2 × 2 m", wet: false, capacity: "Evento", price: 125, image: "/images/algodao-doce.png", description: "Máquina profissional pronta para adoçar o evento. Insumos sob consulta.", features: ["Máquina profissional", "Carrinho de apoio", "Insumos sob consulta", "Monitor disponível"] },
  { id: 5, name: "Arco de Balões", category: "Decoração", age: "Livre", size: "3 × 2,5 m", wet: false, capacity: "Personalizado", price: 200, image: "/images/arco-baloes.png", description: "Composição orgânica personalizada para valorizar a entrada ou mesa principal.", features: ["Balões premium", "Cores personalizadas", "Montagem no local", "Composição orgânica"] },
  { id: 6, name: "Kit Mesas & Cadeiras", category: "Estrutura", age: "Livre", size: "Sob medida", wet: false, capacity: "Personalizado", price: 69, image: "/images/real/mesas-cadeiras-real.jpeg", description: "Conjuntos para receber seus convidados com praticidade, organização e conforto.", features: ["Mesas e cadeiras resistentes", "Quantidade personalizada", "Entrega organizada", "Montagem sob consulta"] },
  { id: 7, name: "Mesa de Sinuca", category: "Jogos", age: "Livre", size: "Consultar", wet: false, capacity: "Uso alternado", price: null, image: "/images/real/sinuca-real.jpeg", description: "Uma opção clássica para divertir jovens e adultos durante todo o evento.", features: ["Tacos e bolas inclusos", "Montagem no local", "Ideal para confraternizações", "Disponibilidade sob consulta"] },
  { id: 8, name: "Pebolim", category: "Jogos", age: "Livre", size: "Consultar", wet: false, capacity: "Uso alternado", price: null, image: "/images/real/pebolim-real.jpeg", description: "Partidas rápidas e muita diversão para completar a área de jogos da festa.", features: ["Mesa completa", "Montagem no local", "Diversão para várias idades", "Disponibilidade sob consulta"] },
  { id: 9, name: "Aero Hockey", category: "Jogos", age: "Livre", size: "Consultar", wet: false, capacity: "Uso alternado", price: null, image: "/images/real/aero-hockey-real.jpeg", description: "Uma atração dinâmica para deixar a área de jogos ainda mais animada.", features: ["Acessórios inclusos", "Montagem no local", "Ideal para eventos e festas", "Disponibilidade sob consulta"] }
]

export const categories = ["Todos", "Infláveis", "Brinquedos", "Jogos", "Doces", "Decoração", "Estrutura", "Serviços"]
