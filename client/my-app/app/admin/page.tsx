"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  CheckCheck,
  Download,
  Edit3,
  Eye,
  ImagePlus,
  Loader2,
  LogOut,
  Package,
  PencilLine,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
  Users,
  Warehouse,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", description: "Progress and health" },
  { id: "users", label: "User Management", description: "Customer records" },
  { id: "orders", label: "Order Management", description: "Status and revenue" },
  { id: "reviews", label: "Review Management", description: "Ratings and feedback" },
  { id: "products", label: "Product Management", description: "CRUD and uploads" },
  { id: "queries", label: "Query Management", description: "Contact inbox" },
  { id: "inventory", label: "Inventory", description: "Stock control" },
] as const;

const ORDER_STATUSES = ["ALL", "PENDING", "DISPATCHED", "DELIVERED", "CANCELLED"] as const;

const PRODUCT_CATEGORIES = {
  newborn: [
    "Rompers",
    "Bodysuits",
    "Newborn Starter sets",
    "Thermals",
    "Gift sets",
    "Knitwears",
    "Sets & suits",
    "Infant essentials",
  ],
  toddler: [
    "Co ords",
    "Sweat shirts",
    "Trousers",
  ],
  accessories: [],
} as const;

const NEWBORN_SIZE_OPTIONS = ["0-3M", "3-6M", "6-9M", "9-12M"] as const;
const TODDLER_SIZE_OPTIONS = ["1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y"] as const;

const COLOR_PRESETS = [
  "#111827",
  "#1D4ED8",
  "#DC2626",
  "#F59E0B",
  "#16A34A",
  "#7C3AED",
  "#0F766E",
  "#D946EF",
  "#F97316",
  "#F8FAFC",
] as const;

type SidebarSection = (typeof SIDEBAR_ITEMS)[number]["id"];

type MeResponse = {
  data?: {
    user?: {
      fullName?: string | null;
      email?: string;
      role?: "USER" | "ADMIN";
    };
  };
};

type Overview = {
  products: number;
  activeProducts: number;
  lowStockProducts: number;
  orders: number;
  pendingOrders: number;
  revenue: number;
  activeUsers: number;
  registeredUsers: number;
};

type ProductImage = {
  id: string;
  type: string;
  url: string;
  path: string;
  altText: string | null;
  position: number;
};

type ColorImageDraft = {
  id: string;
  color: string;
  file: File;
  previewUrl: string;
};

type VariantStockEntry = {
  size: string | null;
  color: string | null;
  quantity: number;
};

type Product = {
  id: string;
  name: string;
  category: string | null;
  ageGroup: "newborn" | "toddler" | "accessories";
  gender: "boy" | "girl" | null;
  tags: string[];
  price: number;
  discountPercent?: number;
  description?: string | null;
  sizes: string[];
  colors: string[];
  variantStock: VariantStockEntry[];
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  image: string | string[];
  images: ProductImage[];
};

type Order = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  postalCode: string | null;
  notes: string | null;
  paymentMethod: string;
  promoCode: string | null;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  status: string;
  itemsJson: unknown;
  createdAt: string;
  updatedAt: string;
};

type OrderItem = {
  name?: string;
  size?: string;
  quantity?: number;
  price?: number;
};

type Customer = {
  email: string;
  fullName: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  orderCount: number;
  totalSpent: number;
  deliveredRevenue: number;
  lastOrderAt: string | null;
  lastStatus: string | null;
};

type CustomerDetail = Customer & {
  orders: Order[];
};

type ReviewItem = {
  id: string;
  name: string;
  city: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
};

type QueryItem = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
};

type DashboardResponse = {
  data?: {
    overview?: Overview;
    products?: Product[];
    orders?: Order[];
    customers?: Customer[];
    reviews?: ReviewItem[];
    queries?: QueryItem[];
  };
};

type QueryResponse = {
  data?: {
    queries?: QueryItem[];
    total?: number;
    unread?: number;
  };
};

type SiteSettingResponse = {
  data?: {
    cutoffAt?: string | null;
  };
};

type QueryView = "unread" | "read" | "all";

type CustomerDetailResponse = {
  data?: {
    customer?: Customer;
    orders?: Order[];
  };
};

type ReviewFormState = {
  name: string;
  city: string;
  rating: string;
  review: string;
};

type ProductFormState = {
  name: string;
  category: string | null;
  ageGroup: "newborn" | "toddler" | "accessories";
  gender: "boy" | "girl" | null;
  tags: string;
  price: string;
  discountPercent: string;
  description: string;
  sizes: string[];
  colors: string[];
  variantStock: VariantStockEntry[];
  stockQuantity: string;
  lowStockThreshold: string;
  isActive: boolean;
  isFeatured: boolean;
};

const emptyForm: ProductFormState = {
  name: "",
  category: PRODUCT_CATEGORIES.newborn[0],
  ageGroup: "newborn" as "newborn" | "toddler" | "accessories",
  gender: "boy" as "boy" | "girl" | null,
  tags: "",
  price: "",
  discountPercent: "15",
  description: "",
  sizes: [],
  colors: [],
  variantStock: [],
  stockQuantity: "0",
  lowStockThreshold: "5",
  isActive: true,
  isFeatured: false,
};

const emptyReviewForm: ReviewFormState = {
  name: "",
  city: "",
  rating: "5",
  review: "",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value);
}

function parseOrderItems(itemsJson: unknown) {
  if (!Array.isArray(itemsJson)) {
    return [];
  }

  return itemsJson.filter((item): item is OrderItem => Boolean(item) && typeof item === "object");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function commaJoin(values: string[]) {
  return values.join(", ");
}

function getSizeOptions(ageGroup: ProductFormState["ageGroup"]) {
  if (ageGroup === "newborn") {
    return NEWBORN_SIZE_OPTIONS;
  }

  if (ageGroup === "toddler") {
    return TODDLER_SIZE_OPTIONS;
  }

  return [] as const;
}

function sanitizeSizesForAgeGroup(ageGroup: ProductFormState["ageGroup"], sizes: string[]) {
  return sizes.filter((size) => getSizeOptions(ageGroup).includes(size as never));
}

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeColors(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (isHexColor(value) ? value.toUpperCase() : value));
}

function normalizeVariantStockEntry(entry: Partial<VariantStockEntry>): VariantStockEntry {
  return {
    size: entry.size?.trim() || null,
    color: entry.color?.trim() || null,
    quantity: Math.max(0, Number(entry.quantity) || 0),
  };
}

function reconcileVariantStock(entries: VariantStockEntry[], sizes: string[], colors: string[]) {
  const sizeValues = sizes.length > 0 ? sizes : [null];
  const colorValues = colors.length > 0 ? colors : [null];

  return sizeValues.flatMap((size) => {
    return colorValues.map((color) => {
      const existing = entries.find((entry) => entry.size === size && entry.color === color);
      return normalizeVariantStockEntry({ size, color, quantity: existing?.quantity ?? 0 });
    });
  });
}

function calculateVariantStockTotal(entries: VariantStockEntry[]) {
  return entries.reduce((sum, entry) => sum + entry.quantity, 0);
}

function updateVariantStockQuantity(
  entries: VariantStockEntry[],
  sizes: string[],
  colors: string[],
  size: string | null,
  color: string | null,
  quantity: number
) {
  const next = reconcileVariantStock(entries, sizes, colors);
  const target = next.find((entry) => entry.size === size && entry.color === color);

  if (target) {
    target.quantity = Math.max(0, quantity);
  }

  return next;
}

function buildInitialVariantStock(product: {
  sizes: string[];
  colors: string[];
  variantStock?: VariantStockEntry[];
  stockQuantity: number;
}) {
  const normalized = Array.isArray(product.variantStock) && product.variantStock.length > 0
    ? reconcileVariantStock(product.variantStock.map(normalizeVariantStockEntry), product.sizes, product.colors)
    : reconcileVariantStock([], product.sizes, product.colors);

  if (normalized.some((entry) => entry.quantity > 0)) {
    return normalized;
  }

  if (normalized.length > 0) {
    normalized[0] = {
      ...normalized[0],
      quantity: product.stockQuantity,
    };
  }

  return normalized;
}

function formatColorLabel(value: string) {
  return isHexColor(value) ? value.toUpperCase() : value;
}

function calculateCompareAtPrice(price: string | number, discountPercent: string | number) {
  const numericPrice = Number(price) || 0;
  const numericDiscount = Math.min(100, Math.max(0, Number(discountPercent) || 0));

  if (numericDiscount <= 0 || numericDiscount >= 100) {
    return numericPrice;
  }

  return Math.round(numericPrice / (1 - numericDiscount / 100));
}

function formatVariantLabel(size: string | null, color: string | null) {
  const sizeLabel = size ?? "General";
  const colorLabel = color ?? "General";

  return `${sizeLabel} • ${colorLabel}`;
}

function getCategories(ageGroup: "newborn" | "toddler" | "accessories") {
  return PRODUCT_CATEGORIES[ageGroup];
}

function isAccessories(ageGroup: ProductFormState["ageGroup"]) {
  return ageGroup === "accessories";
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[var(--foreground)]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [activeSection, setActiveSection] = useState<SidebarSection>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [queryTotal, setQueryTotal] = useState(0);
  const [queryUnread, setQueryUnread] = useState(0);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<(typeof ORDER_STATUSES)[number]>("ALL");
  const [orderFromDate, setOrderFromDate] = useState("");
  const [orderToDate, setOrderToDate] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [colorImageDrafts, setColorImageDrafts] = useState<ColorImageDraft[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormState>(emptyReviewForm);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [queryView, setQueryView] = useState<QueryView>("unread");
  const [newArrivalsCutoff, setNewArrivalsCutoff] = useState<string | null>(null);
  const [savingNewArrivals, setSavingNewArrivals] = useState(false);
  const [inventoryOnlyLowStock, setInventoryOnlyLowStock] = useState(false);
  const [colorPickerValue, setColorPickerValue] = useState("#111827");
  const colorImageInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingColorUpload, setPendingColorUpload] = useState<string | null>(null);

  const noticeTone = useMemo(() => {
    if (!notice) {
      return null;
    }

    return /successfully|uploaded/i.test(notice) ? "success" : "error";
  }, [notice]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const variantStockGrid = useMemo(
    () => reconcileVariantStock(form.variantStock, form.sizes, form.colors),
    [form.colors, form.sizes, form.variantStock]
  );

  const variantStockTotal = useMemo(
    () => calculateVariantStockTotal(variantStockGrid),
    [variantStockGrid]
  );

  const categoryOptions = useMemo(() => getCategories(form.ageGroup), [form.ageGroup]);

  useEffect(() => {
    if (isAccessories(form.ageGroup)) {
      if (form.category !== null || form.gender !== null) {
        setForm((current) => ({ ...current, category: null, gender: null }));
      }
      return;
    }

    if (!categoryOptions.some((category) => category === form.category)) {
      setForm((current) => ({ ...current, category: categoryOptions[0] ?? null }));
    }
  }, [categoryOptions, form.ageGroup, form.category, form.gender]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function apiFetch(path: string, init?: RequestInit) {
    return fetch(`${API_BASE_URL}/api${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  }

  async function refreshDashboard() {
    try {
      const [overviewResponse, productsResponse, customersResponse, settingsResponse] = await Promise.all([
        apiFetch("/admin/overview"),
        apiFetch("/admin/products"),
        apiFetch("/admin/customers?limit=50"),
        apiFetch("/site-settings/new-arrivals"),
      ]);

      if (!overviewResponse.ok || !productsResponse.ok || !customersResponse.ok || !settingsResponse.ok) {
        throw new Error("Failed to load admin dashboard");
      }

      const overviewJson = (await overviewResponse.json()) as DashboardResponse;
      const productsJson = (await productsResponse.json()) as DashboardResponse;
      const customersJson = (await customersResponse.json()) as DashboardResponse;
      const settingsJson = (await settingsResponse.json()) as SiteSettingResponse;

      setOverview(overviewJson.data?.overview ?? null);
      setProducts(productsJson.data?.products ?? []);
      setCustomers(customersJson.data?.customers ?? []);
      setNewArrivalsCutoff(settingsJson.data?.cutoffAt ?? null);
      setNotice(null);

      const nextEmail = selectedCustomerEmail ?? customersJson.data?.customers?.[0]?.email ?? null;
      setSelectedCustomerEmail(nextEmail);
      if (nextEmail) {
        await loadCustomerDetail(nextEmail);
      } else {
        setCustomerDetail(null);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load admin dashboard");
    }
  }

  async function loadOrders(nextStatus = orderFilter, nextFrom = orderFromDate, nextTo = orderToDate) {
    try {
      const statusQuery = nextStatus === "ALL" ? "PENDING" : nextStatus;
      const queryParts = [`limit=50`, `status=${encodeURIComponent(statusQuery)}`];

      if (nextFrom) {
        queryParts.push(`from=${encodeURIComponent(nextFrom)}`);
      }

      if (nextTo) {
        queryParts.push(`to=${encodeURIComponent(nextTo)}`);
      }

      const response = await apiFetch(`/admin/orders?${queryParts.join("&")}`);

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const payload = (await response.json()) as { data?: { orders?: Order[] } };
      setOrders(payload.data?.orders ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load orders");
    }
  }

  async function refreshReviews() {
    try {
      const response = await apiFetch("/admin/reviews?limit=100");
      if (!response.ok) {
        throw new Error("Failed to load reviews");
      }

      const payload = (await response.json()) as { data?: { reviews?: ReviewItem[] } };
      setReviews(payload.data?.reviews ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load reviews");
    }
  }

  async function refreshQueries() {
    try {
      const response = await apiFetch("/admin/queries");

      if (!response.ok) {
        throw new Error("Failed to load queries");
      }

      const payload = (await response.json()) as QueryResponse;
      setQueries(payload.data?.queries ?? []);
      setQueryTotal(payload.data?.total ?? 0);
      setQueryUnread(payload.data?.unread ?? 0);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load queries");
    }
  }

  async function loadCustomerDetail(email: string) {
    try {
      const response = await apiFetch(`/admin/customers/${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Failed to load customer details");
      }

      const payload = (await response.json()) as CustomerDetailResponse;
      if (payload.data?.customer) {
        setCustomerDetail({
          ...payload.data.customer,
          orders: payload.data.orders ?? [],
        });
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load customer details");
    }
  }

  async function refreshNewArrivalsCutoff() {
    setSavingNewArrivals(true);

    try {
      const response = await apiFetch("/site-settings/new-arrivals", {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to update new arrivals cutoff");
      }

      const payload = (await response.json()) as SiteSettingResponse;
      setNewArrivalsCutoff(payload.data?.cutoffAt ?? null);
      setNotice("New arrivals cutoff updated successfully");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to update new arrivals cutoff");
    } finally {
      setSavingNewArrivals(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/auth");
          return;
        }

        const payload = (await response.json()) as MeResponse;
        const role = payload.data?.user?.role;

        if (role !== "ADMIN") {
          router.replace("/");
          return;
        }

        if (!cancelled) {
          setAdminName(payload.data?.user?.fullName || "Admin");
          await refreshDashboard();
          await loadOrders();
          await refreshReviews();
          await refreshQueries();
        }
      } catch {
        router.replace("/auth");
        return;
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    setForm({
      name: selectedProduct.name,
      category: selectedProduct.category,
      ageGroup: selectedProduct.ageGroup,
      gender: selectedProduct.gender,
      tags: commaJoin(selectedProduct.tags),
      price: String(selectedProduct.price),
      discountPercent: String(selectedProduct.discountPercent ?? 15),
      description: selectedProduct.description ?? "",
      sizes: sanitizeSizesForAgeGroup(selectedProduct.ageGroup, selectedProduct.sizes),
      colors: normalizeColors(selectedProduct.colors),
      variantStock: buildInitialVariantStock(selectedProduct),
      stockQuantity: String(selectedProduct.stockQuantity),
      lowStockThreshold: String(selectedProduct.lowStockThreshold),
      isActive: selectedProduct.isActive,
      isFeatured: selectedProduct.isFeatured,
    });
    const firstColor = selectedProduct.colors.find((color) => isHexColor(color));
    if (firstColor) {
      setColorPickerValue(firstColor.toUpperCase());
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedReviewId) {
      setReviewForm(emptyReviewForm);
      return;
    }

    const selectedReview = reviews.find((review) => review.id === selectedReviewId);
    if (!selectedReview) {
      return;
    }

    setReviewForm({
      name: selectedReview.name,
      city: selectedReview.city,
      rating: String(selectedReview.rating),
      review: selectedReview.review,
    });
  }, [reviews, selectedReviewId]);

  const overviewCards = [
    { label: "Products", value: overview?.products ?? 0, icon: Package, tint: "#f97316" },
    { label: "Active Users", value: overview?.activeUsers ?? 0, icon: Users, tint: "#7c3aed" },
    { label: "Orders", value: overview?.orders ?? 0, icon: ShoppingCart, tint: "#5cb5ec" },
    { label: "Revenue", value: formatMoney(overview?.revenue ?? 0), icon: Download, tint: "#16a34a" },
    { label: "Low Stock", value: overview?.lowStockProducts ?? 0, icon: AlertTriangle, tint: "#f59e0b" },
    { label: "Pending", value: overview?.pendingOrders ?? 0, icon: Warehouse, tint: "#0ea5e9" },
  ];

  function startNewProduct() {
    setSelectedProductId(null);
    setForm({ ...emptyForm, category: getCategories(emptyForm.ageGroup)[0] ?? null, gender: "boy" });
    setColorPickerValue("#111827");
    setColorImageDrafts([]);
    setPendingColorUpload(null);
    setActiveSection("products");
    setNotice(null);
  }

  function toggleSize(size: string) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((value) => value !== size)
        : [...current.sizes, size],
      variantStock: reconcileVariantStock(
        current.variantStock,
        current.sizes.includes(size)
          ? current.sizes.filter((value) => value !== size)
          : [...current.sizes, size],
        current.colors
      ),
    }));
  }

  function addColor(color: string) {
    const normalized = color.trim().toUpperCase();

    if (!normalized || !isHexColor(normalized)) {
      return;
    }

    setForm((current) => {
      if (current.colors.includes(normalized)) {
        return current;
      }

      return {
        ...current,
        colors: [...current.colors, normalized],
        variantStock: reconcileVariantStock(current.variantStock, current.sizes, [...current.colors, normalized]),
      };
    });

    setColorPickerValue(normalized);
  }

  function removeColor(color: string) {
    setForm((current) => ({
      ...current,
      colors: current.colors.filter((value) => value !== color),
      variantStock: reconcileVariantStock(
        current.variantStock,
        current.sizes,
        current.colors.filter((value) => value !== color)
      ),
    }));

    setColorImageDrafts((current) => {
      const removed = current.find((draft) => draft.color === color);

      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return current.filter((draft) => draft.color !== color);
    });
  }

  function openColorImagePicker(color: string) {
    setPendingColorUpload(color);
    colorImageInputRef.current?.click();
  }

  function setDraftImageForColor(color: string, file: File) {
    setColorImageDrafts((current) => {
      const existing = current.find((draft) => draft.color === color);

      if (existing) {
        URL.revokeObjectURL(existing.previewUrl);
      }

      const nextDraft = {
        id: existing?.id ?? window.crypto.randomUUID(),
        color,
        file,
        previewUrl: URL.createObjectURL(file),
      };

      return [...current.filter((draft) => draft.color !== color), nextDraft];
    });
  }

  function clearColorDraftImages() {
    setColorImageDrafts((current) => {
      current.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
      return [];
    });

    setPendingColorUpload(null);

    if (colorImageInputRef.current) {
      colorImageInputRef.current.value = "";
    }
  }

  function handleColorImageSelection(files: File[]) {
    if (files.length === 0 || !pendingColorUpload) {
      return;
    }

    setDraftImageForColor(pendingColorUpload, files[0]);
    setPendingColorUpload(null);

    if (colorImageInputRef.current) {
      colorImageInputRef.current.value = "";
    }
  }

  async function uploadFilesToProduct(productId: string, files: ColorImageDraft[], existingImagesCount: number) {
    if (files.length === 0) {
      return;
    }

    const uploadErrors: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const draftImage = files[index];
      const body = new FormData();
      body.append("files", draftImage.file);
      body.append("altText", `${form.name.trim()} - ${draftImage.color}`);
      body.append("position", String(existingImagesCount + index));
      body.append("isPrimary", String(existingImagesCount === 0 && index === 0));

      const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}/images/batch`, {
        method: "POST",
        credentials: "include",
        body,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        uploadErrors.push(`${draftImage.file.name}: ${error?.message || "Failed to upload image"}`);
      }
    }

    if (uploadErrors.length > 0) {
      throw new Error(uploadErrors.join(" | "));
    }
  }

  async function saveProduct() {
    setSavingProduct(true);
    setNotice(null);

    if (form.ageGroup !== "accessories" && form.colors.length > 0 && selectedProductId === null && colorImageDrafts.length !== form.colors.length) {
      setNotice("Select one image for each selected color before saving the product.");
      setSavingProduct(false);
      return;
    }

    const nextVariantStock = reconcileVariantStock(form.variantStock, form.sizes, form.colors);
    const nextStockQuantity = calculateVariantStockTotal(nextVariantStock);

    const payload = {
      name: form.name.trim(),
      category: form.ageGroup === "accessories" ? null : form.category?.trim() ?? null,
      ageGroup: form.ageGroup,
      gender: form.ageGroup === "accessories" ? null : form.gender,
      tags: parseCommaList(form.tags),
      price: Number(form.price),
      discountPercent: Number(form.discountPercent),
      description: form.description,
      sizes: form.sizes,
      colors: form.colors,
      variantStock: nextVariantStock,
      stockQuantity: nextStockQuantity,
      lowStockThreshold: Number(form.lowStockThreshold),
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };

    try {
      const response = await apiFetch(selectedProductId ? `/admin/products/${selectedProductId}` : "/admin/products", {
        method: selectedProductId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to save product");
      }

      const result = (await response.json()) as { data?: { product?: Product } };
      const savedProduct = result.data?.product ?? null;
      const nextProductId = savedProduct?.id ?? null;

      setSelectedProductId(nextProductId);

      if (nextProductId && colorImageDrafts.length > 0) {
        await uploadFilesToProduct(nextProductId, colorImageDrafts, savedProduct?.images?.length ?? 0);
        clearColorDraftImages();
      }

      setNotice(
        colorImageDrafts.length > 0
          ? (selectedProductId ? "Product updated successfully with images uploaded" : "Product created successfully with images uploaded")
          : (selectedProductId ? "Product updated successfully" : "Product created successfully")
      );
      await refreshDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/auth");
    }
  }

  async function deleteProduct(productId: string) {
    if (!window.confirm("Delete this product and all its images?")) {
      return;
    }

    const response = await apiFetch(`/admin/products/${productId}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Failed to delete product");
    }

    if (selectedProductId === productId) {
      startNewProduct();
    }

    await refreshDashboard();
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const response = await apiFetch(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Failed to update order status");
    }

    await refreshDashboard();
  }

  async function saveReview() {
    setSavingReview(true);
    setNotice(null);

    const payload = {
      name: reviewForm.name.trim(),
      city: reviewForm.city.trim(),
      rating: Number(reviewForm.rating),
      review: reviewForm.review.trim(),
    };

    try {
      const response = await apiFetch(selectedReviewId ? `/admin/reviews/${selectedReviewId}` : "/admin/reviews", {
        method: selectedReviewId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to save review");
      }

      setNotice(selectedReviewId ? "Review updated successfully" : "Review created successfully");
      setSelectedReviewId(null);
      setReviewForm(emptyReviewForm);
      await refreshReviews();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to save review");
    } finally {
      setSavingReview(false);
    }
  }

  async function deleteReview(reviewId: string) {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    const response = await apiFetch(`/admin/reviews/${reviewId}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Failed to delete review");
    }

    if (selectedReviewId === reviewId) {
      setSelectedReviewId(null);
      setReviewForm(emptyReviewForm);
    }

    await refreshReviews();
  }

  const filteredOrders = orders.filter((order) => orderFilter === "ALL" || order.status.toUpperCase() === orderFilter);
  const visibleOrders = filteredOrders.filter((order) => {
    if (!orderFromDate && !orderToDate) {
      return true;
    }

    const orderDate = new Date(order.createdAt);
    const normalized = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate()).getTime();
    const fromBoundary = orderFromDate ? new Date(`${orderFromDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const toBoundary = orderToDate ? new Date(`${orderToDate}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;

    return normalized >= fromBoundary && normalized <= toBoundary;
  });
  const filteredCustomers = customers.filter((customer) => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return true;

    return [customer.email, customer.fullName, customer.mobile, customer.address, customer.city, customer.postalCode]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const filteredProducts = products.filter((product) => {
    const query = catalogSearch.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [product.name, product.category, product.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesInventory = !inventoryOnlyLowStock || product.stockQuantity <= product.lowStockThreshold;

    return matchesQuery && matchesInventory;
  });

  const visibleQueries = queries.filter((query) => {
    if (queryView === "unread") {
      return query.status === "NEW";
    }

    if (queryView === "read") {
      return query.status !== "NEW";
    }

    return true;
  });

  const searchedQueries = visibleQueries.filter((query) => {
    const search = querySearch.trim().toLowerCase();
    if (!search) return true;

    return [query.name, query.email, query.mobile, query.subject, query.message, query.status].join(" ").toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.7)] p-8 shadow-[0_20px_60px_rgba(17,24,39,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading admin dashboard...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[32px] border border-black/5 bg-[linear-gradient(180deg,rgba(255,250,241,0.98),rgba(255,255,255,0.95))] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:sticky lg:top-2 lg:h-[calc(100vh-0.5rem)] lg:overflow-hidden">
          <div className="rounded-[24px] bg-[#1f2937] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/70">Admin Hub</p>
                <h1 className="mt-2 text-2xl font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {adminName}
                </h1>
                <p className="mt-1 text-sm text-white/75">Full control over users, orders, products, and inventory.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleLogout();
                }}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          <nav className="mt-4 space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${active ? "border-[#8b5a2b] bg-[#fff8ef]" : "border-transparent bg-white hover:bg-black/5"}`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-[var(--foreground)]">{item.label}</span>
                    <span className="block text-xs text-[var(--muted)]">{item.description}</span>
                  </span>
                  <ChevronRight className={`h-4 w-4 ${active ? "text-[#8b5a2b]" : "text-[var(--muted)]"}`} />
                </button>
              );
            })}
          </nav>

        </aside>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[32px] border border-black/5 bg-[linear-gradient(135deg,rgba(255,249,240,0.96),rgba(255,255,255,0.94),rgba(242,249,255,0.96))] shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
            <div className="border-b border-black/5 px-5 py-6 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b5a2b]">{SIDEBAR_ITEMS.find((item) => item.id === activeSection)?.label}</p>
                  <h2 className="mt-2 text-3xl font-bold text-[var(--foreground)] sm:text-4xl" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {activeSection === "overview" && "Live progress at a glance"}
                    {activeSection === "users" && "Customer records and details"}
                    {activeSection === "orders" && "Manage order status and revenue"}
                    {activeSection === "reviews" && "Manage ratings and feedback"}
                    {activeSection === "products" && "Create and manage products"}
                    {activeSection === "queries" && "Review and manage contact queries"}
                    {activeSection === "inventory" && "Stock levels and low inventory"}
                  </h2>
                </div>
                {activeSection === "products" ? (
                  <button
                    type="button"
                    onClick={startNewProduct}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#1f2937] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    New Product
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 px-5 py-6 sm:grid-cols-2 xl:grid-cols-3 sm:px-8">
              {overviewCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article key={card.label} className="rounded-3xl border border-black/5 bg-white/85 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-[var(--muted)]">{card.label}</p>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${card.tint}18` }}>
                        <Icon className="h-5 w-5" style={{ color: card.tint }} />
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-[var(--foreground)]">{card.value}</p>
                  </article>
                );
              })}
            </div>

            {notice ? (
              <div
                className={`fixed right-4 top-4 z-50 w-[min(92vw,24rem)] rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
                  noticeTone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{notice}</p>
                  <button type="button" onClick={() => setNotice(null)} className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70 hover:opacity-100">
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {activeSection === "overview" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Progress Snapshot" subtitle="Use this to monitor traffic, stock health, and revenue movement.">
                <div className="space-y-4">
                  {[
                    { label: "Active users", value: overview?.activeUsers ?? 0, total: overview?.registeredUsers ?? 0, color: "#7c3aed" },
                    { label: "Orders", value: overview?.orders ?? 0, total: overview?.orders ?? 0, color: "#5cb5ec" },
                    { label: "Revenue", value: overview?.revenue ?? 0, total: overview?.revenue ?? 0, color: "#16a34a" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-black/5 bg-[#fffaf2] p-4">
                      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                        <span>{item.label}</span>
                        <span>{item.label === "Revenue" ? formatMoney(item.value) : `${item.value}`}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(10, item.total ? (item.value / item.total) * 100 : 100))}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Recent Alerts" subtitle="Quick signals that need admin attention.">
                <div className="space-y-3 text-sm text-[var(--foreground)]">
                  <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">{overview?.lowStockProducts ?? 0} products are low on stock.</div>
                  <div className="rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] p-4">{overview?.pendingOrders ?? 0} orders are still pending.</div>
                  <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4">Delivered orders are counted in revenue automatically.</div>
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeSection === "users" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <SectionCard title="Customer Directory" subtitle="Search users and inspect the details saved in the database.">
                <div className="mb-4 flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--muted)]" />
                  <input
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder="Search by name, email, mobile, address or city"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                  />
                </div>

                <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-2">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.email}
                      type="button"
                      onClick={async () => {
                        setSelectedCustomerEmail(customer.email);
                        setActiveSection("users");
                        await loadCustomerDetail(customer.email);
                      }}
                      className={`w-full rounded-3xl border p-4 text-left transition ${selectedCustomerEmail === customer.email ? "border-[#8b5a2b] bg-[#fff8ef]" : "border-black/5 bg-white hover:bg-black/[0.03]"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{customer.fullName || customer.email}</p>
                          <p className="text-sm text-[var(--muted)]">{customer.email}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {customer.mobile || "No mobile"} • {customer.city || "No city"}
                          </p>
                        </div>
                        <div className="text-right text-xs text-[var(--muted)]">
                          <p>{customer.orderCount} orders</p>
                          <p>{formatMoney(customer.deliveredRevenue)} delivered revenue</p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {filteredCustomers.length === 0 ? <div className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-[var(--muted)]">No customers found.</div> : null}
                </div>
              </SectionCard>

              <SectionCard title="Customer Profile" subtitle="Shows all customer data currently stored in the database.">
                {customerDetail ? (
                  <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoTile label="Customer name" value={customerDetail.fullName || "-"} />
                      <InfoTile label="Email" value={customerDetail.email} />
                      <InfoTile label="Mobile" value={customerDetail.mobile || "-"} />
                      <InfoTile label="Address" value={customerDetail.address || "-"} />
                      <InfoTile label="City" value={customerDetail.city || "-"} />
                      <InfoTile label="Postal code" value={customerDetail.postalCode || "-"} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatTile label="Order count" value={`${customerDetail.orderCount}`} />
                      <StatTile label="Total spent" value={formatMoney(customerDetail.totalSpent)} />
                      <StatTile label="Delivered revenue" value={formatMoney(customerDetail.deliveredRevenue)} />
                    </div>

                    <div className="rounded-3xl border border-black/5 bg-[#fffaf2] p-4 text-sm text-[var(--muted)]">
                      Last order: <span className="font-semibold text-[var(--foreground)]">{formatDate(customerDetail.lastOrderAt)}</span> • Status:{" "}
                      <span className="font-semibold text-[var(--foreground)]">{customerDetail.lastStatus || "-"}</span>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#8b5a2b]">Order history</p>
                      <div className="space-y-3">
                        {customerDetail.orders.map((order) => (
                          <article key={order.id} className="rounded-3xl border border-black/5 bg-white p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-semibold text-[var(--foreground)]">{order.id}</p>
                                <p className="text-sm text-[var(--muted)]">{formatDate(order.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-[var(--foreground)]">{formatMoney(order.totalAmount)}</p>
                                <p className="text-sm text-[var(--muted)]">{order.status}</p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-[var(--muted)]">Select a customer to inspect their database record.</div>
                )}
              </SectionCard>
            </div>
          ) : null}

          {activeSection === "orders" ? (
            <div className="space-y-6">
              <SectionCard title="Order Filter" subtitle="Filter the list by order status. Delivered orders count as revenue in the overview.">
                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                      <Field label="From date">
                        <input
                          type="date"
                          value={orderFromDate}
                          onChange={(event) => {
                            const nextFrom = event.target.value;
                            setOrderFromDate(nextFrom);
                            void loadOrders(orderFilter, nextFrom, orderToDate);
                          }}
                          className={INPUT_CLASS}
                        />
                      </Field>
                      <Field label="To date">
                        <input
                          type="date"
                          value={orderToDate}
                          onChange={(event) => {
                            const nextTo = event.target.value;
                            setOrderToDate(nextTo);
                            void loadOrders(orderFilter, orderFromDate, nextTo);
                          }}
                          className={INPUT_CLASS}
                        />
                      </Field>
                    </div>
                    <p className="mb-4 text-xs text-[var(--muted)]">All shows pending orders only. Once an order gets a status, it moves into that specific section.</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                          onClick={() => {
                            setOrderFilter(status);
                            void loadOrders(status, orderFromDate, orderToDate);
                          }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${orderFilter === status ? "bg-[#1f2937] text-white" : "bg-[#fffaf2] text-[var(--foreground)] hover:bg-black/5"}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </SectionCard>

              <div className="grid gap-4">
                {visibleOrders.map((order) => (
                  <SectionCard key={order.id} title={`${order.fullName} • ${order.id}`} subtitle={`${order.email} • ${order.mobile} • ${order.city}`}>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                      <div className="space-y-2 text-sm text-[var(--muted)]">
                        <p>Address: <span className="text-[var(--foreground)]">{order.address}</span></p>
                        <p>Postal code: <span className="text-[var(--foreground)]">{order.postalCode || "-"}</span></p>
                        <p>Payment: <span className="text-[var(--foreground)]">{order.paymentMethod}</span></p>
                        <p>Promo code: <span className="text-[var(--foreground)]">{order.promoCode || "-"}</span></p>
                        <p>Status: <span className="font-semibold text-[var(--foreground)]">{order.status}</span></p>
                      </div>
                      <div className="rounded-3xl border border-black/5 bg-[#fffaf2] p-4 text-sm">
                        <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(order.subtotal)}</span></p>
                        <p className="mt-2 flex justify-between"><span>Discount</span><span>-{formatMoney(order.discountAmount)}</span></p>
                        <p className="mt-2 flex justify-between"><span>Delivery</span><span>{formatMoney(order.deliveryCharge)}</span></p>
                        <p className="mt-3 flex justify-between border-t border-black/5 pt-3 text-base font-bold text-[var(--foreground)]"><span>Total</span><span>{formatMoney(order.totalAmount)}</span></p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                      <div className="rounded-3xl border border-black/5 bg-white p-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">Ordered items</p>
                        {parseOrderItems(order.itemsJson).length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {parseOrderItems(order.itemsJson).map((item, index) => (
                              <div key={`${order.id}-item-${index}`} className="rounded-2xl bg-[#fffaf2] px-3 py-2 text-sm text-[var(--muted)]">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-medium text-[var(--foreground)]">{item.name || "Item"}</span>
                                  <span>{formatMoney((item.price || 0) * (item.quantity || 0))}</span>
                                </div>
                                <p className="mt-1 text-xs">Size {item.size || "-"} · Qty {item.quantity || 0}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-[var(--muted)]">No item details were saved with this order.</p>
                        )}
                      </div>

                      <div className="rounded-3xl border border-black/5 bg-white p-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">Notes</p>
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[var(--muted)]">{order.notes?.trim() ? order.notes : "-"}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {ORDER_STATUSES.filter((status) => status !== "ALL").map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateOrderStatus(order.id, status).then(() => loadOrders(orderFilter, orderFromDate, orderToDate)).catch((error) => setNotice(error instanceof Error ? error.message : "Failed to update order"))}
                          className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-black/5"
                        >
                          Set {status}
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                ))}

                {filteredOrders.length === 0 ? <SectionCard title="No orders found"><div className="text-sm text-[var(--muted)]">No orders match the selected filter.</div></SectionCard> : null}
              </div>
            </div>
          ) : null}

          {activeSection === "reviews" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <SectionCard title="Review Editor" subtitle="Create or update customer feedback that appears in the public reviews feed.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name"><input value={reviewForm.name} onChange={(event) => setReviewForm((current) => ({ ...current, name: event.target.value }))} className={INPUT_CLASS} /></Field>
                  <Field label="City"><input value={reviewForm.city} onChange={(event) => setReviewForm((current) => ({ ...current, city: event.target.value }))} className={INPUT_CLASS} /></Field>
                  <Field label="Rating">
                    <select value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))} className={INPUT_CLASS}>
                      <option value="5">5</option>
                      <option value="4">4</option>
                      <option value="3">3</option>
                      <option value="2">2</option>
                      <option value="1">1</option>
                    </select>
                  </Field>
                  <div />
                  <Field label="Review" className="md:col-span-2">
                    <textarea value={reviewForm.review} onChange={(event) => setReviewForm((current) => ({ ...current, review: event.target.value }))} rows={5} className={`${INPUT_CLASS} min-h-[140px] py-3`} />
                  </Field>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={saveReview} disabled={savingReview} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#1f2937] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
                    {savingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />} {selectedReviewId ? "Update Review" : "Create Review"}
                  </button>
                  <button type="button" onClick={() => { setSelectedReviewId(null); setReviewForm(emptyReviewForm); }} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-black/5">
                    Reset
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="Review Library" subtitle="Edit or delete reviews currently stored in the database.">
                <div className="mb-4 flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--muted)]" />
                  <input value={reviewSearch} onChange={(event) => setReviewSearch(event.target.value)} placeholder="Search reviews" className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]" />
                </div>

                <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-2">
                  {reviews
                    .filter((review) => {
                      const query = reviewSearch.trim().toLowerCase();
                      if (!query) return true;

                      return [review.name, review.city, review.review]
                        .join(" ")
                        .toLowerCase()
                        .includes(query);
                    })
                    .map((review) => (
                      <article key={review.id} className={`rounded-3xl border p-4 transition ${selectedReviewId === review.id ? "border-[#8b5a2b] bg-[#fff8ef]" : "border-black/5 bg-white"}`}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-[var(--foreground)]">{review.name}</p>
                              <span className="rounded-full bg-[#fff0d7] px-2 py-0.5 text-xs font-semibold text-[#8b5a2b]">{review.rating}/5</span>
                            </div>
                            <p className="mt-1 text-sm text-[var(--muted)]">{review.city}</p>
                            <p className="mt-2 line-clamp-3 text-sm text-[var(--foreground)]">{review.review}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" onClick={() => { setSelectedReviewId(review.id); setActiveSection("reviews"); }} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-black/5">
                              <Edit3 className="h-4 w-4" /> Edit
                            </button>
                            <button type="button" onClick={() => deleteReview(review.id).catch((error) => setNotice(error instanceof Error ? error.message : "Failed to delete review"))} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#ffecec]">
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}

                  {reviews.filter((review) => {
                    const query = reviewSearch.trim().toLowerCase();
                    if (!query) return true;
                    return [review.name, review.city, review.review].join(" ").toLowerCase().includes(query);
                  }).length === 0 ? <div className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-[var(--muted)]">No reviews found.</div> : null}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeSection === "products" ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 rounded-[28px] border border-black/5 bg-[#fffaf2] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">New Arrivals Control</p>
                    <p className="text-sm text-[var(--muted)]">
                      {newArrivalsCutoff ? `Products created after ${formatDate(newArrivalsCutoff)} will appear on the New Arrivals page.` : "All active products currently appear on the New Arrivals page."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={refreshNewArrivalsCutoff}
                    disabled={savingNewArrivals}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#8b5a2b] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {savingNewArrivals ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />} Set new arrivals from now
                  </button>
                </div>
              </div>

              <SectionCard title="Product Management" subtitle="Use dropdowns for available categories, then upload images from your file explorer.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={INPUT_CLASS} /></Field>
                  <Field label="Age group">
                    <select
                      value={form.ageGroup}
                      onChange={(event) => {
                        const nextAgeGroup = event.target.value as ProductFormState["ageGroup"];
                        setForm((current) => ({
                          ...current,
                          ageGroup: nextAgeGroup,
                          category: nextAgeGroup === "accessories" ? null : getCategories(nextAgeGroup)[0] ?? null,
                          gender: nextAgeGroup === "accessories" ? null : current.gender ?? "boy",
                          sizes: [],
                          variantStock: reconcileVariantStock(current.variantStock, [], current.colors),
                        }));
                      }}
                      className={INPUT_CLASS}
                    >
                      <option value="newborn">Newborn</option>
                      <option value="toddler">Toddler</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </Field>
                  <Field label="Gender">
                    <select
                      value={form.gender ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as "boy" | "girl" }))}
                      disabled={form.ageGroup === "accessories"}
                      className={INPUT_CLASS}
                    >
                      <option value="" disabled>
                        Not applicable
                      </option>
                      <option value="boy">Boy</option>
                      <option value="girl">Girl</option>
                    </select>
                  </Field>
                  <Field label="Category">
                    <select
                      value={form.category ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value || null }))}
                      disabled={form.ageGroup === "accessories"}
                      className={INPUT_CLASS}
                    >
                      {form.ageGroup === "accessories" ? (
                        <option value="" disabled>
                          Not applicable
                        </option>
                      ) : (
                        categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                      )}
                    </select>
                  </Field>
                  <Field label="Price"><input type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className={INPUT_CLASS} /></Field>
                  <Field label="Discount (%)">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.discountPercent}
                      onChange={(event) => setForm((current) => ({ ...current, discountPercent: event.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <div className="rounded-3xl border border-dashed border-[#e7d7bf] bg-[#fffaf2] px-4 py-3 text-sm text-[var(--muted)] md:col-span-2">
                    Displayed price: <span className="font-semibold text-[var(--foreground)]">{formatMoney(calculateCompareAtPrice(form.price, form.discountPercent))}</span>
                  </div>
                  {form.ageGroup !== "accessories" ? (
                    <Field label="Sizes" className="md:col-span-2">
                      <div className="space-y-5 rounded-3xl border border-black/5 bg-[#fffaf2] p-4">
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {form.ageGroup === "newborn" ? "Newborn sizes" : "Toddler sizes"}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {getSizeOptions(form.ageGroup).map((option) => {
                              const checked = form.sizes.includes(option);

                              return (
                                <label
                                  key={option}
                                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition ${checked ? "border-[#8b5a2b] bg-white shadow-sm" : "border-black/10 bg-white/80 hover:border-[#8b5a2b]/40"}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSize(option)}
                                    className="h-4 w-4 accent-[#8b5a2b]"
                                  />
                                  <span className="font-medium text-[var(--foreground)]">{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-xs text-[var(--muted)]">Select every size you want to show on the product page.</p>
                      </div>
                    </Field>
                  ) : null}
                  <Field label="Colors" className="md:col-span-2">
                    <div className="space-y-4 rounded-3xl border border-black/5 bg-[#fffaf2] p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="color"
                          value={colorPickerValue}
                          onChange={(event) => setColorPickerValue(event.target.value.toUpperCase())}
                          className="h-11 w-16 cursor-pointer rounded-2xl border border-black/10 bg-white p-1"
                          aria-label="Pick a color"
                        />
                        <input
                          type="text"
                          value={colorPickerValue}
                          onChange={(event) => setColorPickerValue(event.target.value.toUpperCase())}
                          placeholder="#111827"
                          className={INPUT_CLASS}
                          style={{ maxWidth: "10rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => addColor(colorPickerValue)}
                          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#8b5a2b] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          Add color
                        </button>
                      </div>

                      <div className="space-y-3">
                        {form.colors.length > 0 ? (
                          form.colors.map((color) => {
                            const draftImage = colorImageDrafts.find((draft) => draft.color === color) ?? null;

                            return (
                              <div key={color} className="rounded-3xl border border-black/10 bg-white p-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">{formatColorLabel(color)}</p>
                                    <p className="text-xs text-[var(--muted)]">Upload one image for this color</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openColorImagePicker(color)}
                                    className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#8b5a2b] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                                  >
                                    {draftImage ? "Change image" : "Upload image"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeColor(color)}
                                    className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-black/5"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="mt-3">
                                  {draftImage ? (
                                    <article className="overflow-hidden rounded-2xl border border-black/5 bg-[#fffaf2] shadow-sm">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={draftImage.previewUrl} alt={`${color} preview`} className="h-36 w-full object-cover" />
                                      <div className="p-3">
                                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{draftImage.file.name}</p>
                                        <p className="mt-1 text-xs text-[var(--muted)]">Linked to {formatColorLabel(color)}</p>
                                      </div>
                                    </article>
                                  ) : (
                                    <div className="rounded-2xl border border-dashed border-black/10 bg-[#fffaf2] p-4 text-sm text-[var(--muted)]">
                                      No image uploaded yet for this color.
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-[var(--muted)]">No colors selected yet. Pick a color and click Add color.</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => addColor(preset)}
                            className="h-8 w-8 rounded-full border border-black/10 shadow-sm transition hover:scale-105"
                            style={{ backgroundColor: preset }}
                            aria-label={`Add ${preset} color`}
                            title={preset}
                          />
                        ))}
                      </div>
                    </div>
                  </Field>
                  <Field label="Stock by variant" className="md:col-span-2">
                    <div className="space-y-4 rounded-3xl border border-black/5 bg-[#fffaf2] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">Variant stock matrix</p>
                          <p className="text-xs text-[var(--muted)]">Enter stock for each size/color combination. The total is saved automatically.</p>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] shadow-sm">
                          Total stock: {variantStockTotal}
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
                        {form.sizes.length > 0 && form.colors.length > 0 ? (
                          <table className="min-w-full border-collapse text-left text-sm">
                            <thead className="bg-[#fff8ef] text-[var(--foreground)]">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Size</th>
                                {form.colors.map((color) => (
                                  <th key={color} className="px-4 py-3 font-semibold">
                                    <div className="flex items-center gap-2">
                                      <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                                      <span>{formatColorLabel(color)}</span>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {form.sizes.map((size) => (
                                <tr key={size} className="border-t border-black/5">
                                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{size}</td>
                                  {form.colors.map((color) => {
                                    const entry = variantStockGrid.find((item) => item.size === size && item.color === color) ?? { quantity: 0 };

                                    return (
                                      <td key={`${size}-${color}`} className="px-4 py-3">
                                        <input
                                          type="number"
                                          min="0"
                                          value={entry.quantity}
                                          onChange={(event) => {
                                            const quantity = Number(event.target.value);
                                            setForm((current) => ({
                                              ...current,
                                              variantStock: updateVariantStockQuantity(current.variantStock, current.sizes, current.colors, size, color, quantity),
                                            }));
                                          }}
                                          className="h-10 w-24 rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#8b5a2b]"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : form.sizes.length > 0 ? (
                          <div className="space-y-2 p-4">
                            {form.sizes.map((size) => {
                              const entry = variantStockGrid.find((item) => item.size === size && item.color === null) ?? { quantity: 0 };

                              return (
                                <div key={size} className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-[#fffaf2] px-3 py-2.5">
                                  <span className="font-medium text-[var(--foreground)]">{size}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={entry.quantity}
                                    onChange={(event) => {
                                      const quantity = Number(event.target.value);
                                      setForm((current) => ({
                                        ...current,
                                        variantStock: updateVariantStockQuantity(current.variantStock, current.sizes, current.colors, size, null, quantity),
                                      }));
                                    }}
                                    className="h-10 w-24 rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#8b5a2b]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : form.colors.length > 0 ? (
                          <div className="space-y-2 p-4">
                            {form.colors.map((color) => {
                              const entry = variantStockGrid.find((item) => item.size === null && item.color === color) ?? { quantity: 0 };

                              return (
                                <div key={color} className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-[#fffaf2] px-3 py-2.5">
                                  <span className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                                    <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                                    {formatColorLabel(color)}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={entry.quantity}
                                    onChange={(event) => {
                                      const quantity = Number(event.target.value);
                                      setForm((current) => ({
                                        ...current,
                                        variantStock: updateVariantStockQuantity(current.variantStock, current.sizes, current.colors, null, color, quantity),
                                      }));
                                    }}
                                    className="h-10 w-24 rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#8b5a2b]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4">
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-[#fffaf2] px-3 py-2.5">
                              <span className="font-medium text-[var(--foreground)]">General stock</span>
                              <input
                                type="number"
                                min="0"
                                value={variantStockGrid[0]?.quantity ?? 0}
                                onChange={(event) => {
                                  const quantity = Number(event.target.value);
                                  setForm((current) => ({
                                    ...current,
                                    variantStock: updateVariantStockQuantity(current.variantStock, current.sizes, current.colors, null, null, quantity),
                                  }));
                                }}
                                className="h-10 w-24 rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#8b5a2b]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Field>
                  <Field label="Low stock threshold"><input type="number" value={form.lowStockThreshold} onChange={(event) => setForm((current) => ({ ...current, lowStockThreshold: event.target.value }))} className={INPUT_CLASS} /></Field>
                  <Field label="Tags" className="md:col-span-2"><input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="winter, essentials" className={INPUT_CLASS} /></Field>
                  <Field label="Description" className="md:col-span-2"><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} className={`${INPUT_CLASS} min-h-[110px] py-3`} /></Field>
                  <Field label="Product Images" className="md:col-span-2">
                    <div className="grid gap-4 rounded-3xl border border-black/5 bg-[#fffaf2] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">Product images</p>
                          <p className="text-xs text-[var(--muted)]">Add as many images as you want. Remove any draft before saving.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => colorImageInputRef.current?.click()}
                          className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#8b5a2b] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          <ImagePlus className="h-4 w-4" />
                          Add more
                        </button>
                      </div>

                      <input
                        ref={colorImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          handleColorImageSelection(Array.from(event.target.files ?? []));
                          event.currentTarget.value = "";
                        }}
                      />

                      {colorImageDrafts.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {colorImageDrafts.map((draftImage) => (
                            <article key={draftImage.id} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={draftImage.previewUrl} alt={draftImage.file.name} className="h-36 w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setColorImageDrafts((current) => {
                                    const removed = current.find((image) => image.id === draftImage.id);

                                    if (removed) {
                                      URL.revokeObjectURL(removed.previewUrl);
                                    }

                                    return current.filter((image) => image.id !== draftImage.id);
                                  });
                                }}
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-rose-600"
                                aria-label={`Remove ${draftImage.file.name}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="p-3">
                                <p className="truncate text-sm font-semibold text-[var(--foreground)]">{draftImage.file.name}</p>
                                <p className="mt-1 text-xs text-[var(--muted)]">Linked to {formatColorLabel(draftImage.color)} • Click X to remove before saving</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-sm text-[var(--muted)]">
                          No color-linked images selected yet. Choose a color and upload its image.
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                        <p>{colorImageDrafts.length} color-linked image{colorImageDrafts.length === 1 ? "" : "s"} ready to save.</p>
                        {colorImageDrafts.length > 0 ? (
                          <button type="button" onClick={clearColorDraftImages} className="font-semibold text-[#8b5a2b] hover:underline">
                            Clear all
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </Field>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-[var(--foreground)]">
                  <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Active</label>
                  <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))} /> Featured</label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={saveProduct} disabled={savingProduct} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#1f2937] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
                    {savingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />} {selectedProductId ? "Update Product" : "Create Product"}
                  </button>
                  <button type="button" onClick={startNewProduct} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-black/5">
                    Reset
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="Product Library" subtitle="Edit or delete products, and review stock in one place.">
                <div className="mb-4 flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--muted)]" />
                  <input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]" />
                </div>

                <div className="max-h-[65rem] space-y-3 overflow-y-auto pr-2">
                  {filteredProducts.map((product) => (
                    <article key={product.id} className={`rounded-3xl border p-4 transition ${selectedProductId === product.id ? "border-[#8b5a2b] bg-[#fff8ef]" : "border-black/5 bg-white"}`}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[var(--foreground)]">{product.name}</p>
                            {product.isFeatured ? <span className="rounded-full bg-[#fff0d7] px-2 py-0.5 text-xs font-semibold text-[#8b5a2b]">Featured</span> : null}
                            {!product.isActive ? <span className="rounded-full bg-[#fee2e2] px-2 py-0.5 text-xs font-semibold text-[#b91c1c]">Inactive</span> : null}
                          </div>
                          <p className="mt-1 text-sm text-[var(--muted)]">{product.category} • {product.ageGroup} • {product.gender}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">Stock {product.stockQuantity} • Low stock threshold {product.lowStockThreshold}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => { setSelectedProductId(product.id); setActiveSection("products"); }} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-black/5">
                            <Edit3 className="h-4 w-4" /> Edit
                          </button>
                          <button type="button" onClick={() => deleteProduct(product.id).catch((error) => setNotice(error instanceof Error ? error.message : "Failed to delete product"))} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#ffecec]">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}

                  {filteredProducts.length === 0 ? <div className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-[var(--muted)]">No products found.</div> : null}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeSection === "inventory" ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <SectionCard title="Inventory Table" subtitle="Track stock, how much is left, and which items need attention.">
                <div className="mb-4 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]"><input type="checkbox" checked={inventoryOnlyLowStock} onChange={(event) => setInventoryOnlyLowStock(event.target.checked)} /> Low stock only</label>
                </div>
                <div className="max-h-[32rem] overflow-auto rounded-3xl border border-black/5">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-[#fff8ef] text-[var(--foreground)]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold">Stock</th>
                        <th className="px-4 py-3 font-semibold">Left</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const lowStock = product.stockQuantity <= product.lowStockThreshold;

                        return (
                          <tr key={product.id} className="border-t border-black/5 bg-white">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-[var(--foreground)]">{product.name}</p>
                              <p className="text-xs text-[var(--muted)]">{product.category}</p>
                            </td>
                            <td className="px-4 py-3">{product.stockQuantity}</td>
                            <td className="px-4 py-3">{Math.max(0, product.stockQuantity - product.lowStockThreshold)}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${lowStock ? "bg-[#fffbeb] text-[#b45309]" : "bg-[#ecfdf5] text-[#047857]"}`}>
                                {lowStock ? "Low stock" : "Healthy"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title="Inventory Summary" subtitle="A quick snapshot of stock health.">
                <div className="space-y-3 text-sm">
                  <SummaryRow label="Total products" value={`${overview?.products ?? products.length}`} />
                  <SummaryRow label="Active products" value={`${overview?.activeProducts ?? products.filter((product) => product.isActive).length}`} />
                  <SummaryRow label="Low stock items" value={`${overview?.lowStockProducts ?? products.filter((product) => product.stockQuantity <= product.lowStockThreshold).length}`} />
                  <SummaryRow label="Out of stock" value={`${products.filter((product) => product.stockQuantity === 0).length}`} />
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeSection === "queries" ? (
            <div className="grid gap-6">
              <SectionCard title="Query Inbox" subtitle="Keep the contact form inbox inside the same admin dashboard.">
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatTile label="Total queries" value={`${queryTotal}`} />
                  <StatTile label="Unread queries" value={`${queryUnread}`} />
                  <StatTile label="Visible now" value={`${searchedQueries.length}`} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { key: "unread", label: "Raw queries" },
                    { key: "read", label: "Marked as read" },
                    { key: "all", label: "All queries" },
                  ].map((option) => {
                    const active = queryView === option.key;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setQueryView(option.key as QueryView)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-[#1f2937] text-white" : "bg-[#fffaf2] text-[var(--foreground)] hover:bg-black/5"}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--muted)]" />
                  <input
                    value={querySearch}
                    onChange={(event) => setQuerySearch(event.target.value)}
                    placeholder="Search by name, email, subject, mobile, or message"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                  />
                </div>

                <div className="mt-5 max-h-[34rem] space-y-3 overflow-y-auto pr-2">
                  {searchedQueries
                    .map((query) => (
                      <article key={query.id} className={`rounded-3xl border p-4 transition ${query.status === "NEW" ? "border-rose-200 bg-[#fffaf9]" : "border-black/5 bg-white"}`}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-bold text-[var(--foreground)]">{query.name}</p>
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${query.status === "NEW" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                                {query.status === "NEW" ? "Unread" : "Read"}
                              </span>
                            </div>
                            <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2 xl:grid-cols-4">
                              <p><span className="font-semibold text-[var(--foreground)]">Email:</span> {query.email}</p>
                              <p><span className="font-semibold text-[var(--foreground)]">Mobile:</span> {query.mobile}</p>
                              <p><span className="font-semibold text-[var(--foreground)]">Subject:</span> {query.subject}</p>
                              <p><span className="font-semibold text-[var(--foreground)]">Sent:</span> {formatDate(query.createdAt)}</p>
                            </div>
                            <p className="rounded-2xl border border-black/5 bg-[#fffaf2] p-4 text-sm leading-7 text-[var(--foreground)]">{query.message}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <button
                              type="button"
                              onClick={async () => {
                                const response = await apiFetch(`/admin/queries/${query.id}/read`, { method: "PATCH" });

                                if (!response.ok) {
                                  const error = await response.json().catch(() => null);
                                  setNotice(error?.message || "Failed to mark query as read");
                                  return;
                                }

                                setNotice("Query marked as read successfully");
                                await refreshQueries();
                              }}
                              disabled={query.status !== "NEW"}
                              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CheckCheck className="h-4 w-4" />
                              Mark as read
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm("Delete this query?")) {
                                  return;
                                }

                                const response = await apiFetch(`/admin/queries/${query.id}`, { method: "DELETE" });

                                if (!response.ok) {
                                  const error = await response.json().catch(() => null);
                                  setNotice(error?.message || "Failed to delete query");
                                  return;
                                }

                                setNotice("Query deleted successfully");
                                await refreshQueries();
                              }}
                              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#ffecec]"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}

                  {searchedQueries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-[var(--muted)]">No queries found.</div>
                  ) : null}
                </div>
              </SectionCard>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="block text-sm font-medium text-[var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#fffaf2] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b5a2b]">{label}</p>
      <p className="mt-2 text-sm text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#fffaf2] px-4 py-3">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}

const INPUT_CLASS = "h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[#c4a16f]";
