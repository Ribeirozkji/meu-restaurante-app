import type {
  Address,
  Category,
  Customer,
  DailyClosing,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  StockItem,
} from "@/types";
import { buildOrderCode } from "@/utils/format";
import { calculateDeliveryFee } from "@/utils/delivery";

import imgCafe from "@/assets/cat-cafe.jpg";
import imgLanches from "@/assets/cat-lanches.jpg";
import imgAlmoco from "@/assets/cat-almoco.jpg";
import imgJantar from "@/assets/cat-jantar.jpg";
import imgBebidas from "@/assets/cat-bebidas.jpg";
import imgSobremesas from "@/assets/cat-sobremesas.jpg";

export const categories: Category[] = [
  { id: "promocoes", name: "Promoções" },
  { id: "cafe-da-manha", name: "Café da manhã" },
  { id: "lanches", name: "Lanches" },
  { id: "almoco", name: "Almoço" },
  { id: "jantar", name: "Jantar" },
  { id: "bebidas", name: "Bebidas" },
  { id: "sobremesas", name: "Sobremesas" },
];

const categoryImage: Record<string, string> = {
  "cafe-da-manha": imgCafe,
  lanches: imgLanches,
  almoco: imgAlmoco,
  jantar: imgJantar,
  bebidas: imgBebidas,
  sobremesas: imgSobremesas,
  promocoes: imgLanches,
};

export function imageForCategory(category: string) {
  return categoryImage[category] ?? imgLanches;
}

const commonAddons = [
  { id: "a1", name: "Queijo extra", price: 3 },
  { id: "a2", name: "Bacon", price: 4.5 },
  { id: "a3", name: "Molho especial", price: 2 },
];

const drinkAddons = [
  { id: "a4", name: "Gelo e limão", price: 1 },
  { id: "a5", name: "Copo 500ml", price: 2.5 },
];

type Seed = [
  string,
  string,
  string,
  number,
  Product["category"],
  number,
  number,
  string[],
];

const seeds: Seed[] = [
  ["X-Burger Especial", "Hambúrguer artesanal, queijo, alface, tomate e molho especial.", "lanches", 18.9, "lanches", 4.9, 128, ["Pão brioche", "Blend 180g", "Queijo prato", "Alface", "Tomate"]],
  ["X-Bacon Duplo", "Dois blends, bacon crocante, cheddar e cebola caramelizada.", "lanches", 26.5, "lanches", 4.8, 96, ["Pão brioche", "2 blends 150g", "Bacon", "Cheddar"]],
  ["Coxinha da Casa", "Coxinha de frango com catupiry, massa leve e crocante.", "lanches", 7.5, "lanches", 4.7, 142, ["Frango desfiado", "Catupiry", "Massa de batata"]],
  ["Pastel de Carne", "Pastel frito na hora com recheio generoso de carne temperada.", "lanches", 9.9, "lanches", 4.5, 78, ["Massa de pastel", "Carne moída", "Temperos"]],
  ["Tapioca de Queijo Coalho", "Tapioca fresquinha com queijo coalho e manteiga de garrafa.", "cafe-da-manha", 12.9, "cafe-da-manha", 4.6, 64, ["Goma de tapioca", "Queijo coalho"]],
  ["Cuscuz Nordestino", "Cuscuz com ovos mexidos, queijo e manteiga.", "cafe-da-manha", 14.5, "cafe-da-manha", 4.7, 88, ["Cuscuz de milho", "Ovos", "Queijo"]],
  ["Pão na Chapa com Café", "Pão francês na chapa acompanhado de café coado.", "cafe-da-manha", 9.5, "cafe-da-manha", 4.4, 110, ["Pão francês", "Manteiga", "Café"]],
  ["Misto Quente", "Pão de forma, presunto e queijo derretido na chapa.", "cafe-da-manha", 10.9, "cafe-da-manha", 4.3, 52, ["Pão de forma", "Presunto", "Queijo"]],
  ["Prato Executivo de Frango", "Filé de frango grelhado, arroz, feijão, salada e farofa.", "almoco", 27.9, "almoco", 4.8, 156, ["Filé de frango", "Arroz", "Feijão", "Salada"]],
  ["Feijoada Completa", "Feijoada tradicional com arroz, couve, laranja e torresmo.", "almoco", 38.9, "almoco", 4.9, 74, ["Feijão preto", "Carnes suínas", "Couve", "Arroz"]],
  ["Filé à Parmegiana", "Filé empanado com molho de tomate, queijo gratinado e arroz.", "almoco", 42.5, "almoco", 4.8, 68, ["Filé bovino", "Molho de tomate", "Queijo", "Arroz"]],
  ["Baião de Dois", "Arroz com feijão de corda, queijo coalho e carne de sol.", "almoco", 34.9, "almoco", 4.7, 91, ["Arroz", "Feijão de corda", "Carne de sol", "Queijo coalho"]],
  ["Escondidinho de Carne de Sol", "Purê de macaxeira gratinado com carne de sol desfiada.", "jantar", 32.9, "jantar", 4.9, 83, ["Macaxeira", "Carne de sol", "Queijo"]],
  ["Risoto de Camarão", "Risoto cremoso com camarões salteados e alho-poró.", "jantar", 49.9, "jantar", 4.8, 41, ["Arroz arbóreo", "Camarão", "Creme de leite"]],
  ["Espaguete ao Sugo", "Massa fresca com molho de tomate rústico e manjericão.", "jantar", 28.5, "jantar", 4.5, 57, ["Massa fresca", "Tomate", "Manjericão"]],
  ["Coca-Cola 350ml", "Refrigerante lata bem gelado.", "bebidas", 6.5, "bebidas", 4.6, 210, ["Refrigerante"]],
  ["Suco de Caju 500ml", "Suco natural de caju feito na hora.", "bebidas", 9.9, "bebidas", 4.7, 132, ["Polpa de caju", "Água", "Açúcar"]],
  ["Água Mineral 500ml", "Água mineral sem gás.", "bebidas", 4, "bebidas", 4.4, 98, ["Água mineral"]],
  ["Pudim de Leite", "Pudim cremoso de leite condensado com calda de caramelo.", "sobremesas", 11.9, "sobremesas", 4.9, 86, ["Leite condensado", "Ovos", "Caramelo"]],
  ["Bolo de Rolo Fatia", "Fatia de bolo de rolo pernambucano com goiabada.", "sobremesas", 10.5, "sobremesas", 4.8, 63, ["Massa fina", "Goiabada"]],
];

export const mockProducts: Product[] = seeds.map((seed, index) => {
  const [name, description, _cat, price, category, rating, sales, ingredients] =
    seed;
  return {
    id: `p${index + 1}`,
    name,
    description,
    ingredients,
    price,
    category,
    rating,
    available: index !== 14 && index !== 17,
    image: imageForCategory(category),
    addons: category === "bebidas" ? drinkAddons : commonAddons,
    sales,
  };
});

/** Produtos em promoção também aparecem na categoria "Promoções". */
export const promoProductIds = ["p1", "p3", "p9", "p19"];

const customerSeeds: Array<[string, string, string, string, string]> = [
  ["João Silva", "(81) 99999-1234", "joao.silva@email.com", "Boa Viagem", "Rua Exemplo, 100"],
  ["Maria Souza", "(81) 98888-2201", "maria.souza@email.com", "Pina", "Av. Central, 450"],
  ["Carlos Pereira", "(81) 97777-3312", "carlos.pereira@email.com", "Imbiribeira", "Rua das Acácias, 78"],
  ["Ana Beatriz", "(81) 96666-4423", "ana.beatriz@email.com", "Setúbal", "Rua do Sol, 12"],
  ["Pedro Henrique", "(81) 95555-5534", "pedro.henrique@email.com", "Espinheiro", "Rua Verde, 340"],
  ["Juliana Lima", "(81) 94444-6645", "juliana.lima@email.com", "Graças", "Av. Rosa e Silva, 900"],
  ["Rafael Costa", "(81) 93333-7756", "rafael.costa@email.com", "Boa Viagem", "Rua Ribeiro de Brito, 55"],
  ["Fernanda Alves", "(81) 92222-8867", "fernanda.alves@email.com", "Pina", "Rua Antônio Falcão, 210"],
  ["Lucas Martins", "(81) 91111-9978", "lucas.martins@email.com", "Torre", "Rua Real da Torre, 620"],
  ["Camila Rocha", "(81) 90000-1089", "camila.rocha@email.com", "Casa Forte", "Rua Fernandes Vieira, 88"],
];

export const mockCustomers: Customer[] = customerSeeds.map(([name, phone, email, district, address], i) => ({
  id: `c${i + 1}`,
  name,
  phone,
  email,

  avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
  district,
  address,
  cep: `5100${i}-00${i}`,
  city: "Recife",
  createdAt: new Date(2026, 1 + i, 5 + i).toISOString(),
}));

export const mockStock: StockItem[] = [
  ["Pão brioche", "Padaria", 120, 40, "un"],
  ["Blend bovino 150g", "Carnes", 68, 30, "un"],
  ["Bacon em fatias", "Carnes", 12, 15, "kg"],
  ["Queijo prato", "Frios", 9, 10, "kg"],
  ["Queijo coalho", "Frios", 22, 8, "kg"],
  ["Frango desfiado", "Carnes", 34, 12, "kg"],
  ["Carne de sol", "Carnes", 0, 10, "kg"],
  ["Goma de tapioca", "Secos", 25, 10, "kg"],
  ["Cuscuz de milho", "Secos", 40, 15, "kg"],
  ["Arroz", "Secos", 90, 30, "kg"],
  ["Feijão preto", "Secos", 6, 15, "kg"],
  ["Camarão limpo", "Frutos do mar", 0, 6, "kg"],
  ["Coca-Cola 350ml", "Bebidas", 144, 48, "un"],
  ["Polpa de caju", "Bebidas", 18, 20, "kg"],
  ["Leite condensado", "Sobremesas", 0, 12, "un"],
].map(([name, category, quantity, minQuantity, unit], i) => ({
  id: `s${i + 1}`,
  name: name as string,
  category: category as string,
  quantity: quantity as number,
  minQuantity: minQuantity as number,
  unit: unit as string,
}));

export const mockAddresses: Address[] = [
  {
    id: "ad1",
    label: "Casa",
    cep: "51020-000",
    street: "Rua Exemplo",
    number: "100",
    complement: "Apto 402",
    district: "Boa Viagem",
    city: "Recife",
    state: "PE",
    reference: "Próximo à praça",
    isPrimary: true,
    distanceKm: 4.3,
  },
  {
    id: "ad2",
    label: "Trabalho",
    cep: "51110-220",
    street: "Av. Central",
    number: "450",
    complement: "Sala 12",
    district: "Pina",
    city: "Recife",
    state: "PE",
    reference: "Prédio azul",
    isPrimary: false,
    distanceKm: 7.1,
  },
];

const statuses: OrderStatus[] = [
  "novo",
  "preparacao",
  "entrega",
  "entregue",
  "entregue",
  "cancelado",
];
const payments: PaymentMethod[] = ["pix", "pix", "dinheiro", "cartao"];

function pseudo(n: number, mod: number) {
  return (n * 7919 + 13) % mod;
}

function buildOrders(): Order[] {
  const orders: Order[] = [];
  const now = new Date(2026, 7, 29, 12, 0, 0);

  for (let i = 0; i < 30; i++) {
    const customer = mockCustomers[pseudo(i, mockCustomers.length)]!;
    const daysAgo = Math.floor(i / 2);
    const created = new Date(now);
    created.setDate(created.getDate() - daysAgo);
    created.setHours(10 + pseudo(i, 12), pseudo(i * 3, 60), 0, 0);

    const itemCount = 1 + pseudo(i, 3);
    const items: OrderItem[] = [];
    for (let j = 0; j < itemCount; j++) {
      const product = mockProducts[pseudo(i * 5 + j * 3, mockProducts.length)]!;
      const quantity = 1 + pseudo(i + j, 2);
      items.push({
        productId: product.id,
        name: product.name,
        quantity,
        price: product.price,
      });
    }
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const distanceKm = Math.round((1.5 + pseudo(i, 70) / 10) * 10) / 10;
    const deliveryFee = calculateDeliveryFee(distanceKm);
    const status = daysAgo === 0 ? statuses[pseudo(i, 4)]! : statuses[3 + pseudo(i, 3)]!;
    const payment = payments[pseudo(i, payments.length)]!;

    orders.push({
      id: `o${i + 1}`,
      code: buildOrderCode(created, 18 + i),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      address: `${customer.address} — ${customer.district}`,
      district: customer.district,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      payment,
      paid: payment !== "dinheiro" && status !== "cancelado",
      status,
      createdAt: created.toISOString(),
      distanceKm,
    });
  }
  return orders;
}

export const mockOrders: Order[] = buildOrders();

/** Cliente logado (mock). */
export const currentCustomer = mockCustomers[4]!;

export function buildDailyClosings(): DailyClosing[] {
  const base = new Date(2026, 7, 29);
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(base);
    date.setDate(date.getDate() - i);
    const orders = 60 + pseudo(i, 45);
    const revenue = Math.round(orders * (24 + pseudo(i, 60) / 10) * 100) / 100;
    return {
      date: date.toISOString(),
      orders,
      revenue,
      averageTicket: Math.round((revenue / orders) * 100) / 100,
    };
  });
}

export const mockDailyClosings = buildDailyClosings();
