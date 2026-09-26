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

export async function fetchInitialData() {
  const [products, stock, customers, addresses, orders, settings] =
    await Promise.all([
      supabase.from("products").select("*").order("id"),
      supabase.from("stock_items").select("*").order("name"),
      supabase.from("customers").select("*").order("name"),
      supabase
        .from("addresses")
        .select("*")
        .eq("customer_id", CURRENT_CUSTOMER_ID)
        .order("created_at"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("restaurant_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  const mappedProducts = (products.data ?? []).map(mapProduct);
  mappedProducts.sort(
    (a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)),
  );

  return {
    products: mappedProducts,
    promoIds: mappedProducts.filter((p) => p.promo).map((p) => p.id),
    stock: (stock.data ?? []).map(mapStock),
    customers: (customers.data ?? []).map(mapCustomer),
    addresses: (addresses.data ?? []).map(mapAddress),
    orders: (orders.data ?? []).map(mapOrder),
    restaurant: mapSettings((settings.data as Row | null) ?? null),
  };
}

/* ---------- escrita ---------- */

export async function insertOrder(order: Order) {
  await supabase.from("orders").insert({
    code: order.code,
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
  });
}

export async function updateOrderStatusDb(id: string, status: Order["status"]) {
  await supabase.from("orders").update({ status }).eq("id", id);
}

export async function upsertProductDb(product: Product, promo = false) {
  await supabase.from("products").upsert({
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
  });
}

export async function deleteProductDb(id: string) {
  await supabase.from("products").delete().eq("id", id);
}

export async function updateStockDb(item: StockItem) {
  await supabase
    .from("stock_items")
    .update({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      unit: item.unit,
    })
    .eq("id", item.id);
}

export async function saveAddressDb(address: Address) {
  const payload = {
    customer_id: CURRENT_CUSTOMER_ID,
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
    await supabase.from("addresses").update(payload).eq("id", address.id);
    return address.id;
  }
  const { data } = await supabase
    .from("addresses")
    .insert(payload)
    .select("id")
    .maybeSingle();
  return data ? String((data as Row)["id"]) : address.id;
}

export async function deleteAddressDb(id: string) {
  await supabase.from("addresses").delete().eq("id", id);
}

export async function setPrimaryAddressDb(id: string) {
  await supabase
    .from("addresses")
    .update({ is_primary: false })
    .eq("customer_id", CURRENT_CUSTOMER_ID);
  await supabase.from("addresses").update({ is_primary: true }).eq("id", id);
}

export async function updateSettingsDb(config: RestaurantConfig) {
  await supabase
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
    .eq("id", 1);
}
