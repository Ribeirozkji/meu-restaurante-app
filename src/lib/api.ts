import { supabase } from "@/integrations/supabase/client";
import type {
  Addon,
  Address,
  Customer,
  Order,
  OrderItem,
  Product,
  StockItem,
} from "@/types";
import type { RestaurantConfig } from "@/config/restaurant";
import { defaultRestaurant } from "@/config/restaurant";
import { imageForCategory } from "@/data/mock";

/* ---------- mapeamento banco -> app ---------- */

type Row = Record<string, unknown>;

function num(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mapProduct(row: Row): Product & { promo: boolean } {
  const category = String(row["category"]) as Product["category"];
  return {
    id: String(row["id"]),
    name: String(row["name"]),
    description: String(row["description"] ?? ""),
    ingredients: (row["ingredients"] as string[] | null) ?? [],
    price: num(row["price"]),
    category,
    rating: num(row["rating"], 5),
    available: Boolean(row["available"]),
    image: imageForCategory(category),
    addons: ((row["addons"] as Addon[] | null) ?? []).map((a) => ({
      ...a,
      price: num(a.price),
    })),
    sales: num(row["sales"]),
    promo: Boolean(row["promo"]),
  };
}

export function mapStock(row: Row): StockItem {
  return {
    id: String(row["id"]),
    name: String(row["name"]),
    category: String(row["category"] ?? "Geral"),
    quantity: num(row["quantity"]),
    minQuantity: num(row["min_quantity"]),
    unit: String(row["unit"] ?? "un"),
  };
}

export function mapCustomer(row: Row): Customer {
  return {
    id: String(row["id"]),
    name: String(row["name"]),
    phone: String(row["phone"] ?? ""),
    email: String(row["email"] ?? ""),
    avatar: String(row["avatar"] ?? ""),
    district: String(row["district"] ?? ""),
    address: String(row["address"] ?? ""),
    cep: String(row["cep"] ?? ""),
    city: String(row["city"] ?? ""),
    createdAt: String(row["created_at"] ?? new Date().toISOString()),
  };
}

export function mapAddress(row: Row): Address {
  return {
    id: String(row["id"]),
    label: String(row["label"] ?? "Casa"),
    cep: String(row["cep"] ?? ""),
    street: String(row["street"] ?? ""),
    number: String(row["number"] ?? ""),
    complement: String(row["complement"] ?? ""),
    district: String(row["district"] ?? ""),
    city: String(row["city"] ?? ""),
    state: String(row["state"] ?? "PE"),
    reference: String(row["reference"] ?? ""),
    isPrimary: Boolean(row["is_primary"]),
    distanceKm: num(row["distance_km"]),
  };
}

export function mapOrder(row: Row): Order {
  return {
    id: String(row["id"]),
    code: String(row["code"]),
    customerId: String(row["customer_id"] ?? ""),
    customerName: String(row["customer_name"] ?? ""),
    customerPhone: String(row["customer_phone"] ?? ""),
    address: String(row["address"] ?? ""),
    district: String(row["district"] ?? ""),
    items: ((row["items"] as OrderItem[] | null) ?? []).map((i) => ({
      ...i,
      price: num(i.price),
      quantity: num(i.quantity, 1),
    })),
    subtotal: num(row["subtotal"]),
    deliveryFee: num(row["delivery_fee"]),
    total: num(row["total"]),
    payment: String(row["payment"] ?? "pix") as Order["payment"],
    paid: Boolean(row["paid"]),
    status: String(row["status"] ?? "novo") as Order["status"],
    createdAt: String(row["created_at"] ?? new Date().toISOString()),
    distanceKm: num(row["distance_km"]),
  };
}

export function mapSettings(row: Row | null): RestaurantConfig {
  if (!row) return defaultRestaurant;
  return {
    ...defaultRestaurant,
    name: String(row["name"] ?? defaultRestaurant.name),
    tagline: String(row["tagline"] ?? defaultRestaurant.tagline),
    address: String(row["address"] ?? defaultRestaurant.address),
    phone: String(row["phone"] ?? defaultRestaurant.phone),
    openingHours: String(row["opening_hours"] ?? defaultRestaurant.openingHours),
    openFrom: num(row["open_from"], defaultRestaurant.openFrom),
    openTo: num(row["open_to"], defaultRestaurant.openTo),
    pixKey: String(row["pix_key"] ?? defaultRestaurant.pixKey),
    deliveryFeePerBlock: num(
      row["delivery_fee_per_block"],
      defaultRestaurant.deliveryFeePerBlock,
    ),
    deliveryBlockKm: num(
      row["delivery_block_km"],
      defaultRestaurant.deliveryBlockKm,
    ),
  };
}

/* ---------- leitura inicial ---------- */

export const CURRENT_CUSTOMER_ID = "c5";

/**
 * Dados do painel (pedidos, estoque, clientes, endereços) só são lidos
 * quando o usuário logado é admin — as regras do banco bloqueiam o resto.
 */
/** Cadastro do cliente ligado ao usuário logado (cria se ainda não existir). */
export async function ensureMyCustomer(): Promise<Customer | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (data) return mapCustomer(data as Row);
  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const { data: created } = await supabase
    .from("customers")
    .insert({
      id: `u-${user.id}`,
      user_id: user.id,
      name: meta["name"] || user.email?.split("@")[0] || "Cliente",
      phone: meta["phone"] ?? "",
      email: user.email ?? "",
    })
    .select("*")
    .maybeSingle();
  return created ? mapCustomer(created as Row) : null;
}

export async function fetchMyAddresses(customerId: string) {
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at");
  return (data ?? []).map(mapAddress);
}

export async function fetchInitialData(isAdmin: boolean) {
  const publicReads = Promise.all([
    supabase.from("products").select("*").order("id"),
    supabase.from("restaurant_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const adminReads = isAdmin
    ? Promise.all([
        supabase.from("stock_items").select("*").order("name"),
        supabase.from("customers").select("*").order("name"),
      ])
    : null;
  // Admin recebe todos os pedidos; cliente logado só os próprios (regra do banco).
  const ordersRead = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const [products, settings] = await publicReads;
  const admin = adminReads ? await adminReads : null;
  const ordersRes = await ordersRead;

  const mappedProducts = (products.data ?? []).map(mapProduct);
  mappedProducts.sort(
    (a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)),
  );

  return {
    products: mappedProducts,
    promoIds: mappedProducts.filter((p) => p.promo).map((p) => p.id),
    stock: (admin?.[0]?.data ?? []).map(mapStock),
    customers: (admin?.[1]?.data ?? []).map(mapCustomer),
    orders: (ordersRes.data ?? []).map(mapOrder),
    restaurant: mapSettings((settings.data as Row | null) ?? null),
  };
}

/* ---------- escrita ---------- */

function check(res: { error: unknown }) {
  if (res.error) throw res.error;
}

export async function insertOrder(order: Order): Promise<Order> {
  const { data, error } = await supabase.from("orders").insert({
    code: "auto", // gerado pelo banco
    customer_id: order.customerId,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    address: order.address,
    district: order.district,
    items: order.items as unknown as never,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    payment: order.payment,
    // O banco só aceita pedido novo como não pago/novo; o admin confirma depois.
    paid: false,
    status: "novo",
    distance_km: order.distanceKm,
  }).select("*").single();
  if (error || !data) throw error ?? new Error("Pedido não gravado");
  return mapOrder(data as Row);
}

export async function updateOrderStatusDb(id: string, status: Order["status"]) {
  check(await supabase.from("orders").update({ status }).eq("id", id));
}

export async function upsertProductDb(product: Product, promo = false) {
  check(await supabase.from("products").upsert({
    id: product.id,
    name: product.name,
    description: product.description,
    ingredients: product.ingredients,
    price: product.price,
    category: product.category,
    rating: product.rating,
    available: product.available,
    addons: product.addons as unknown as never,
    sales: product.sales,
    promo,
  }));
}

export async function deleteProductDb(id: string) {
  check(await supabase.from("products").delete().eq("id", id));
}

export async function updateStockDb(item: StockItem) {
  check(await supabase
    .from("stock_items")
    .update({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      unit: item.unit,
    })
    .eq("id", item.id));
}

export async function saveAddressDb(address: Address, customerId: string) {
  const payload = {
    customer_id: customerId,
    label: address.label,
    cep: address.cep,
    street: address.street,
    number: address.number,
    complement: address.complement,
    district: address.district,
    city: address.city,
    state: address.state,
    reference: address.reference,
    is_primary: address.isPrimary,
    distance_km: address.distanceKm,
  };
  const isUuid = /^[0-9a-f-]{36}$/i.test(address.id);
  if (isUuid) {
    check(await supabase.from("addresses").update(payload).eq("id", address.id));
    return address.id;
  }
  const { data, error } = await supabase
    .from("addresses")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("Endereço não gravado");
  return String((data as Row)["id"]);
}

export async function deleteAddressDb(id: string) {
  check(await supabase.from("addresses").delete().eq("id", id));
}

export async function setPrimaryAddressDb(id: string, customerId: string) {
  check(await supabase
    .from("addresses")
    .update({ is_primary: false })
    .eq("customer_id", customerId));
  check(await supabase.from("addresses").update({ is_primary: true }).eq("id", id));
}

export async function updateSettingsDb(config: RestaurantConfig) {
  check(await supabase
    .from("restaurant_settings")
    .update({
      name: config.name,
      tagline: config.tagline,
      address: config.address,
      phone: config.phone,
      opening_hours: config.openingHours,
      open_from: config.openFrom,
      open_to: config.openTo,
      pix_key: config.pixKey,
      delivery_fee_per_block: config.deliveryFeePerBlock,
      delivery_block_km: config.deliveryBlockKm,
    })
    .eq("id", 1));
}
