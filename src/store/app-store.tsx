import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Address,
  Addon,
  CartItem,
  Customer,
  DailyClosing,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  StockItem,
} from "@/types";
import { currentCustomer as fallbackCustomer } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { defaultRestaurant, type RestaurantConfig } from "@/config/restaurant";
import { buildOrderCode } from "@/utils/format";
import { calculateDeliveryFee } from "@/utils/delivery";
import {
  CURRENT_CUSTOMER_ID,
  deleteAddressDb,
  deleteProductDb,
  fetchInitialData,
  insertOrder,
  saveAddressDb,
  setPrimaryAddressDb,
  updateOrderStatusDb,
  updateSettingsDb,
  updateStockDb,
  upsertProductDb,
} from "@/lib/api";

const CART_KEY = "sabor-da-casa-cart";

interface State {
  cart: CartItem[];
  addresses: Address[];
  orders: Order[];
  products: Product[];
  stock: StockItem[];
  customers: Customer[];
  restaurant: RestaurantConfig;
  promoIds: string[];
}

interface AppStore extends State {
  loading: boolean;
  dailyClosings: DailyClosing[];
  customer: Customer;
  selectedAddress: Address | undefined;
  cartSubtotal: number;
  cartCount: number;
  deliveryFee: number;
  cartTotal: number;
  addToCart: (
    product: Product,
    quantity: number,
    addons: Addon[],
    note: string,
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  saveAddress: (address: Omit<Address, "id" | "distanceKm"> & { id?: string }) => void;
  removeAddress: (id: string) => void;
  setPrimaryAddress: (id: string) => void;
  placeOrder: (payment: PaymentMethod) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  saveProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  toggleProduct: (id: string) => void;
  updateStock: (id: string, quantity: number) => void;
  saveStockItem: (item: StockItem) => void;
  updateRestaurant: (config: Partial<RestaurantConfig>) => void;
}

const AppContext = createContext<AppStore | null>(null);

const initialState: State = {
  cart: [],
  addresses: [],
  orders: [],
  products: [],
  stock: [],
  customers: [],
  restaurant: defaultRestaurant,
  promoIds: [],
};

function buildClosings(orders: Order[]): DailyClosing[] {
  const byDay = new Map<string, { orders: number; revenue: number }>();
  for (const order of orders) {
    if (order.status === "cancelado") continue;
    const day = order.createdAt.slice(0, 10);
    const entry = byDay.get(day) ?? { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += order.total;
    byDay.set(day, entry);
  }
  return Array.from(byDay.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, value]) => ({
      date: new Date(`${day}T12:00:00`).toISOString(),
      orders: value.orders,
      revenue: Math.round(value.revenue * 100) / 100,
      averageTicket:
        value.orders > 0
          ? Math.round((value.revenue / value.orders) * 100) / 100
          : 0,
    }));
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const cart = JSON.parse(raw) as CartItem[];
        setState((prev) => ({ ...prev, cart }));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  }, [state.cart, hydrated]);

  const [authVersion, setAuthVersion] = useState(0);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setAuthVersion((v) => v + 1);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    fetchInitialData()
      .then((data) => {
        if (!active) return;
        setState((prev) => ({
          ...prev,
          products: data.products,
          promoIds: data.promoIds,
          stock: data.stock,
          customers: data.customers,
          addresses: data.addresses,
          orders: data.orders,
          restaurant: data.restaurant,
        }));
      })
      .catch((error) => console.error("Falha ao carregar dados", error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authVersion]);

  const customer = useMemo(
    () =>
      state.customers.find((c) => c.id === CURRENT_CUSTOMER_ID) ??
      state.customers[0] ??
      fallbackCustomer,
    [state.customers],
  );

  const selectedAddress = useMemo(
    () => state.addresses.find((a) => a.isPrimary) ?? state.addresses[0],
    [state.addresses],
  );

  const cartSubtotal = useMemo(
    () =>
      state.cart.reduce(
        (sum, item) =>
          sum +
          item.quantity *
            (item.price + item.addons.reduce((s, a) => s + a.price, 0)),
        0,
      ),
    [state.cart],
  );

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(
    selectedAddress?.distanceKm ?? 0,
    state.restaurant.deliveryBlockKm,
    state.restaurant.deliveryFeePerBlock,
  );

  const dailyClosings = useMemo(() => buildClosings(state.orders), [state.orders]);

  const addToCart = useCallback<AppStore["addToCart"]>(
    (product, quantity, addons, note) => {
      const key = `${product.id}-${addons.map((a) => a.id).join("_")}-${note}`;
      setState((prev) => {
        const existing = prev.cart.find((i) => i.key === key);
        const cart = existing
          ? prev.cart.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
            )
          : [
              ...prev.cart,
              {
                key,
                productId: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity,
                addons,
                note,
              },
            ];
        return { ...prev, cart };
      });
    },
    [],
  );

  const store: AppStore = {
    ...state,
    loading,
    dailyClosings,
    customer,
    selectedAddress,
    cartSubtotal,
    cartCount,
    deliveryFee,
    cartTotal: cartSubtotal + (state.cart.length ? deliveryFee : 0),
    addToCart,
    updateQuantity: (key, quantity) =>
      setState((prev) => ({
        ...prev,
        cart:
          quantity <= 0
            ? prev.cart.filter((i) => i.key !== key)
            : prev.cart.map((i) => (i.key === key ? { ...i, quantity } : i)),
      })),
    removeFromCart: (key) =>
      setState((prev) => ({
        ...prev,
        cart: prev.cart.filter((i) => i.key !== key),
      })),
    clearCart: () => setState((prev) => ({ ...prev, cart: [] })),
    saveAddress: (address) => {
      if (address.id) {
        const existing = state.addresses.find((a) => a.id === address.id);
        const updated = {
          ...(existing as Address),
          ...address,
          id: address.id,
        } as Address;
        setState((prev) => ({
          ...prev,
          addresses: prev.addresses.map((a) =>
            a.id === updated.id ? updated : a,
          ),
        }));
        void saveAddressDb(updated);
        return;
      }
      const created: Address = {
        ...(address as Omit<Address, "id" | "distanceKm">),
        id: `tmp-${Date.now()}`,
        distanceKm: Math.round((2 + (Date.now() % 60) / 10) * 10) / 10,
        isPrimary: address.isPrimary || state.addresses.length === 0,
      };
      setState((prev) => ({
        ...prev,
        addresses: [
          ...prev.addresses.map((a) =>
            created.isPrimary ? { ...a, isPrimary: false } : a,
          ),
          created,
        ],
      }));
      void saveAddressDb(created).then((id) => {
        setState((prev) => ({
          ...prev,
          addresses: prev.addresses.map((a) =>
            a.id === created.id ? { ...a, id } : a,
          ),
        }));
        if (created.isPrimary) void setPrimaryAddressDb(id);
      });
    },
    removeAddress: (id) => {
      setState((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((a) => a.id !== id),
      }));
      void deleteAddressDb(id);
    },
    setPrimaryAddress: (id) => {
      setState((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) => ({
          ...a,
          isPrimary: a.id === id,
        })),
      }));
      void setPrimaryAddressDb(id);
    },
    placeOrder: (payment) => {
      const now = new Date();
      const sequence = 40 + state.orders.length;
      const subtotal = cartSubtotal;
      const fee = deliveryFee;
      const order: Order = {
        id: `o${Date.now()}`,
        code: buildOrderCode(now, sequence),
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        address: selectedAddress
          ? `${selectedAddress.street}, ${selectedAddress.number} — ${selectedAddress.district}`
          : "Endereço não informado",
        district: selectedAddress?.district ?? "—",
        items: state.cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price + i.addons.reduce((s, a) => s + a.price, 0),
          addons: i.addons.map((a) => a.name),
          note: i.note,
        })),
        subtotal,
        deliveryFee: fee,
        total: subtotal + fee,
        payment,
        paid: payment === "pix",
        status: "novo",
        createdAt: now.toISOString(),
        distanceKm: selectedAddress?.distanceKm ?? 0,
      };
      setState((prev) => ({ ...prev, orders: [order, ...prev.orders], cart: [] }));
      void insertOrder(order);
      return order;
    },
    updateOrderStatus: (id, status) => {
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      }));
      void updateOrderStatusDb(id, status);
    },
    saveProduct: (product) => {
      setState((prev) => ({
        ...prev,
        products: prev.products.some((p) => p.id === product.id)
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [...prev.products, product],
      }));
      void upsertProductDb(product, state.promoIds.includes(product.id));
    },
    removeProduct: (id) => {
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
      }));
      void deleteProductDb(id);
    },
    toggleProduct: (id) => {
      const target = state.products.find((p) => p.id === id);
      if (!target) return;
      const updated = { ...target, available: !target.available };
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === id ? updated : p)),
      }));
      void upsertProductDb(updated, state.promoIds.includes(id));
    },
    updateStock: (id, quantity) => {
      const target = state.stock.find((s) => s.id === id);
      if (!target) return;
      const updated = { ...target, quantity: Math.max(0, quantity) };
      setState((prev) => ({
        ...prev,
        stock: prev.stock.map((s) => (s.id === id ? updated : s)),
      }));
      void updateStockDb(updated);
    },
    saveStockItem: (item) => {
      setState((prev) => ({
        ...prev,
        stock: prev.stock.map((s) => (s.id === item.id ? item : s)),
      }));
      void updateStockDb(item);
    },
    updateRestaurant: (config) => {
      const updated = { ...state.restaurant, ...config };
      setState((prev) => ({ ...prev, restaurant: updated }));
      void updateSettingsDb(updated);
    },
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppStoreProvider");
  return ctx;
}

export function stockStatus(item: StockItem) {
  if (item.quantity === 0) return "esgotado" as const;
  if (item.quantity <= item.minQuantity * 0.5) return "critico" as const;
  if (item.quantity <= item.minQuantity) return "baixo" as const;
  return "normal" as const;
}
