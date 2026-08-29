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
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  StockItem,
} from "@/types";
import {
  currentCustomer,
  mockAddresses,
  mockCustomers,
  mockDailyClosings,
  mockOrders,
  mockProducts,
  mockStock,
} from "@/data/mock";
import { defaultRestaurant, type RestaurantConfig } from "@/config/restaurant";
import { buildOrderCode } from "@/utils/format";
import { calculateDeliveryFee } from "@/utils/delivery";

const STORAGE_KEY = "sabor-da-casa-state";

interface PersistedState {
  cart: CartItem[];
  addresses: Address[];
  orders: Order[];
  products: Product[];
  stock: StockItem[];
  restaurant: RestaurantConfig;
}

interface AppStore extends PersistedState {
  customers: typeof mockCustomers;
  dailyClosings: typeof mockDailyClosings;
  customer: typeof currentCustomer;
  selectedAddress?: Address;
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

const initialState: PersistedState = {
  cart: [],
  addresses: mockAddresses,
  orders: mockOrders,
  products: mockProducts,
  stock: mockStock,
  restaurant: defaultRestaurant,
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

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
    customers: mockCustomers,
    dailyClosings: mockDailyClosings,
    customer: currentCustomer,
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
    saveAddress: (address) =>
      setState((prev) => {
        if (address.id) {
          return {
            ...prev,
            addresses: prev.addresses.map((a) =>
              a.id === address.id ? { ...a, ...address } as Address : a,
            ),
          };
        }
        const id = `ad${Date.now()}`;
        const created: Address = {
          ...(address as Omit<Address, "id" | "distanceKm">),
          id,
          distanceKm: Math.round((2 + (Date.now() % 60) / 10) * 10) / 10,
        };
        const isFirst = prev.addresses.length === 0;
        return {
          ...prev,
          addresses: [
            ...prev.addresses.map((a) =>
              created.isPrimary ? { ...a, isPrimary: false } : a,
            ),
            { ...created, isPrimary: created.isPrimary || isFirst },
          ],
        };
      }),
    removeAddress: (id) =>
      setState((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((a) => a.id !== id),
      })),
    setPrimaryAddress: (id) =>
      setState((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) => ({
          ...a,
          isPrimary: a.id === id,
        })),
      })),
    placeOrder: (payment) => {
      const now = new Date();
      const sequence = 40 + state.orders.length;
      const subtotal = cartSubtotal;
      const fee = deliveryFee;
      const order: Order = {
        id: `o${Date.now()}`,
        code: buildOrderCode(now, sequence),
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        customerPhone: currentCustomer.phone,
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
      return order;
    },
    updateOrderStatus: (id, status) =>
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      })),
    saveProduct: (product) =>
      setState((prev) => ({
        ...prev,
        products: prev.products.some((p) => p.id === product.id)
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [...prev.products, product],
      })),
    removeProduct: (id) =>
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
      })),
    toggleProduct: (id) =>
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id ? { ...p, available: !p.available } : p,
        ),
      })),
    updateStock: (id, quantity) =>
      setState((prev) => ({
        ...prev,
        stock: prev.stock.map((s) =>
          s.id === id ? { ...s, quantity: Math.max(0, quantity) } : s,
        ),
      })),
    saveStockItem: (item) =>
      setState((prev) => ({
        ...prev,
        stock: prev.stock.map((s) => (s.id === item.id ? item : s)),
      })),
    updateRestaurant: (config) =>
      setState((prev) => ({
        ...prev,
        restaurant: { ...prev.restaurant, ...config },
      })),
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
