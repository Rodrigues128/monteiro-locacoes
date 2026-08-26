export type FallbackProduct = {
  id: string;
  name: string;
  category: string;
  age: string;
  size: string;
  wet: boolean;
  capacity: string;
  price: number | null;
  image: string;
  fallbackImage: string;
  imagePath: null;
  description: string;
  features: string[];
  active: boolean;
};

export type FallbackGalleryImage = {
  id: string;
  image: string;
  fallbackImage: string;
  image_path: null;
  alt_text: string;
  sort_order: number;
  active: boolean;
};

export const fallbackProducts: FallbackProduct[] = [
  {
    id: "fallback-toboga-aventura",
    name: "Tobogã Aventura",
    category: "Infláveis",
    age: "4+",
    size: "8 × 4 m",
    wet: true,
    capacity: "8 crianças",
    price: 550,
    image: "/images/real/toboga-real.jpeg",
    fallbackImage: "/images/real/toboga-real.jpeg",
    imagePath: null,
    description: "Uma atração de grande impacto para transformar a festa em uma aventura inesquecível.",
    features: ["Estrutura inflável reforçada", "Escada com degraus", "Piscina de amortecimento", "Montagem inclusa"],
    active: true,
  },
  {
    id: "fallback-pula-pula-premium",
    name: "Pula-Pula Premium",
    category: "Brinquedos",
    age: "3+",
    size: "4,3 × 4,3 m",
    wet: false,
    capacity: "6 crianças",
    price: 180,
    image: "/images/real/pula-pula-real.jpeg",
    fallbackImage: "/images/real/pula-pula-real.jpeg",
    imagePath: null,
    description: "Estrutura profissional com rede de proteção e montagem completa no local.",
    features: ["Rede de proteção", "Lona resistente", "Montagem inclusa"],
    active: true,
  },
  {
    id: "fallback-piscina-bolinhas",
    name: "Piscina de Bolinhas",
    category: "Brinquedos",
    age: "2+",
    size: "3 × 3 m",
    wet: false,
    capacity: "8 crianças",
    price: 220,
    image: "/images/real/piscina-bolinhas-real.jpeg",
    fallbackImage: "/images/real/piscina-bolinhas-real.jpeg",
    imagePath: null,
    description: "Diversão segura para os pequenos, com cores vibrantes e acabamento impecável.",
    features: ["Bolinhas coloridas", "Estrutura com rede", "Higienização completa"],
    active: true,
  },
  {
    id: "fallback-arco-baloes",
    name: "Arco de Balões",
    category: "Decoração",
    age: "Livre",
    size: "3 × 2,5 m",
    wet: false,
    capacity: "Personalizado",
    price: 200,
    image: "/images/arco-baloes.png",
    fallbackImage: "/images/arco-baloes.png",
    imagePath: null,
    description: "Composição orgânica personalizada para valorizar a entrada ou a mesa principal.",
    features: ["Cores personalizadas", "Montagem no local", "Composição orgânica"],
    active: true,
  },
  {
    id: "fallback-mesas-cadeiras",
    name: "Kit Mesas & Cadeiras",
    category: "Estrutura",
    age: "Livre",
    size: "Sob medida",
    wet: false,
    capacity: "Personalizado",
    price: 69,
    image: "/images/real/mesas-cadeiras-real.jpeg",
    fallbackImage: "/images/real/mesas-cadeiras-real.jpeg",
    imagePath: null,
    description: "Conjuntos para receber seus convidados com praticidade, organização e conforto.",
    features: ["Mesas e cadeiras resistentes", "Entrega organizada", "Montagem sob consulta"],
    active: true,
  },
  {
    id: "fallback-mesa-sinuca",
    name: "Mesa de Sinuca",
    category: "Jogos",
    age: "Livre",
    size: "Consultar",
    wet: false,
    capacity: "Uso alternado",
    price: null,
    image: "/images/real/sinuca-real.jpeg",
    fallbackImage: "/images/real/sinuca-real.jpeg",
    imagePath: null,
    description: "Uma opção clássica para divertir jovens e adultos durante todo o evento.",
    features: ["Tacos e bolas inclusos", "Montagem no local"],
    active: true,
  },
  {
    id: "fallback-pebolim",
    name: "Pebolim",
    category: "Jogos",
    age: "Livre",
    size: "Consultar",
    wet: false,
    capacity: "Uso alternado",
    price: null,
    image: "/images/real/pebolim-real.jpeg",
    fallbackImage: "/images/real/pebolim-real.jpeg",
    imagePath: null,
    description: "Partidas rápidas e muita diversão para completar a área de jogos da festa.",
    features: ["Mesa completa", "Montagem no local"],
    active: true,
  },
];

export const fallbackGallery: FallbackGalleryImage[] = [
  { id: "fallback-gallery-evento", image: "/images/real/evento-com-criancas.jpeg", fallbackImage: "/images/real/evento-com-criancas.jpeg", image_path: null, alt_text: "Crianças brincando em um evento", sort_order: 1, active: true },
  { id: "fallback-gallery-montagem", image: "/images/real/montagem-completa-real.jpeg", fallbackImage: "/images/real/montagem-completa-real.jpeg", image_path: null, alt_text: "Montagem com brinquedos", sort_order: 2, active: true },
  { id: "fallback-gallery-recreacao", image: "/images/real/recreacao-real.jpeg", fallbackImage: "/images/real/recreacao-real.jpeg", image_path: null, alt_text: "Espaço de recreação preparado", sort_order: 3, active: true },
  { id: "fallback-gallery-carrinho", image: "/images/real/carrinho-guloseimas-real.jpeg", fallbackImage: "/images/real/carrinho-guloseimas-real.jpeg", image_path: null, alt_text: "Carrinho de guloseimas", sort_order: 4, active: true },
  { id: "fallback-gallery-pintura", image: "/images/real/pintura-facial-real.jpeg", fallbackImage: "/images/real/pintura-facial-real.jpeg", image_path: null, alt_text: "Atividade de pintura facial", sort_order: 5, active: true },
];
