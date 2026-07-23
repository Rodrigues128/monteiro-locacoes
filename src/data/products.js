/**
 * @typedef {{
 *   id: number,
 *   name: string,
 *   category: string,
 *   age: string,
 *   size: string,
 *   wet: boolean,
 *   capacity: string,
 *   price: number,
 *   image: string,
 *   description: string,
 *   features: string[]
 * }} Product
 */

/** @type {Product[]} */
export const products = [
  { id: 1, name: "Tobogã Aventura", category: "Infláveis", age: "4+", size: "8 × 4 m", wet: true, capacity: "8 crianças", price: 550, image: "/images/toboga-aventura.png", description: "Uma atração de grande impacto para transformar a festa em uma aventura inesquecível.", features: ["Estrutura inflável reforçada", "Escada de acesso com degraus", "Piscina de amortecimento", "Montagem e desmontação inclusas"] },
  { id: 2, name: "Pula-Pula Premium", category: "Brinquedos", age: "3+", size: "4,3 × 4,3 m", wet: false, capacity: "6 crianças", price: 180, image: "/images/pula-pula-premium.png", description: "Estrutura profissional com rede de proteção e montagem completa no local.", features: ["Rede de proteção total", "Lona de alta resistência", "Capacidade para 6 crianças", "Montagem inclusa"] },
  { id: 3, name: "Piscina de Bolinhas", category: "Brinquedos", age: "2+", size: "3 × 3 m", wet: false, capacity: "8 crianças", price: 220, image: "/images/piscina-bolinhas.png", description: "Diversão segura para os pequenos, com cores vibrantes e acabamento impecável.", features: ["500 bolinhas coloridas", "Estrutura inflável segura", "Ideal para crianças pequenas", "Higienização completa"] },
  { id: 4, name: "Estação Algodão Doce", category: "Doces", age: "Livre", size: "2 × 2 m", wet: false, capacity: "Evento", price: 125, image: "/images/algodao-doce.png", description: "Máquina profissional pronta para adoçar o evento. Insumos sob consulta.", features: ["Máquina profissional", "Carrinho de apoio", "Insumos sob consulta", "Monitor disponível"] },
  { id: 5, name: "Arco de Balões", category: "Decoração", age: "Livre", size: "3 × 2,5 m", wet: false, capacity: "Personalizado", price: 200, image: "/images/arco-baloes.png", description: "Composição orgânica personalizada para valorizar a entrada ou mesa principal.", features: ["Balões premium", "Cores personalizadas", "Montagem no local", "Composição orgânica"] },
  { id: 6, name: "Kit Mesas & Cadeiras", category: "Estrutura", age: "Livre", size: "3 × 3 m", wet: false, capacity: "8 lugares", price: 69, image: "/images/mesas-cadeiras.png", description: "Conjunto completo para receber seus convidados com praticidade e conforto.", features: ["8 cadeiras confortáveis", "1 mesa redonda", "Toalha incluída", "Entrega e montagem"] }
]

export const categories = ["Todos", "Infláveis", "Brinquedos", "Doces", "Decoração", "Estrutura"]
