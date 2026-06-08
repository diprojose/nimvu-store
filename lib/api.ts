import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://nimvu-be-nest.onrender.com" : "http://localhost:3001");

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper de `fetch` nativo de Next.js para activar la caché y Revalidación (ISR)
const fetchWrapper = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  return res.json();
};

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const storage = localStorage.getItem('nimvu-auth-storage');
    if (storage) {
      const { state } = JSON.parse(storage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  }
  return config;
});

export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
  universeId?: string;
  universe?: BackendUniverse;
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface BackendUniverse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  order: number;
  isActive: boolean;
  comingSoon: boolean;
  categories?: BackendCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendBanner {
  id: string;
  universeId?: string | null;
  universe?: BackendUniverse | null;
  image: string;
  mobileImage?: string | null;
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
  textColor?: string | null;
  badgeColor?: string | null;
  titleColor?: string | null;
  subtitleColor?: string | null;
  accentLineColor?: string | null;
  ctaBgColor?: string | null;
  ctaTextColor?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  width?: number;
  length?: number;
  height?: number;
  longDescription?: string;
  categoryId?: string;
  category?: BackendCategory;
  universeId?: string;
  universe?: BackendUniverse;
  discountEndDate?: string | null;
  variants?: BackendVariant[];
  isB2BOnly?: boolean;
}

export interface BackendVariant {
  id: string;
  productId: string;
  name: string;
  stock: number;
  price: number | null;
  discountPrice?: number;
  images: string[];
  sku: string;
}

export interface BackendCollection {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  image: string;
  products: BackendProduct[];
}

// Frontend interfaces based on what I saw in page.tsx
export interface FrontendProduct {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: { id: string; url: string }[];
  variants: { id: string; title: string; sku: string; inventory_quantity: number; price?: number; discountPrice?: number; images?: string[] }[];
  category?: { id: string; name: string; slug: string };
  dimensions?: { width: number; height: number; length: number };
  longDescription?: string;
  discountEndDate?: string | null;
  isB2BOnly?: boolean;
  // Add other fields as necessary based on usage
}

// Adapter to transform BackendProduct to FrontendProduct
const adaptProduct = (product: BackendProduct): FrontendProduct => {
  return {
    id: product.id,
    title: product.name,
    description: product.description || "",
    slug: product.slug || "",
    thumbnail: product.images[0] || "",
    price: product.price,
    discountPrice: product.discountPrice,
    stock: product.stock,
    images: product.images.map((url, index) => ({
      id: `${product.id}-img-${index}`,
      url: url,
    })),
    variants: product.variants?.map((v) => ({
      id: v.id,
      title: v.name,
      sku: v.sku, // Allow frontend search by variant sku
      inventory_quantity: v.stock,
      price: v.price || product.price,
      discountPrice: v.discountPrice,
      images: v.images,
    })) || [],
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug
    } : undefined,
    dimensions: {
      width: product.width || 0,
      height: product.height || 0,
      length: product.length || 0,
    },
    longDescription: product.longDescription || "",
    discountEndDate: product.discountEndDate || null,
    isB2BOnly: product.isB2BOnly || false,
  };
};

export const products = {
  list: async (
    opts:
      | { isB2BContext?: boolean; universeSlug?: string; categorySlug?: string }
      | boolean = {},
  ) => {
    // Backwards-compat: previously called as products.list(isB2BContext: boolean)
    const normalized =
      typeof opts === 'boolean' ? { isB2BContext: opts } : opts;
    const params = new URLSearchParams();
    if (normalized.isB2BContext) params.set('isB2B', 'true');
    if (normalized.universeSlug) params.set('universeSlug', normalized.universeSlug);
    if (normalized.categorySlug) params.set('categorySlug', normalized.categorySlug);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWrapper<BackendProduct[]>(`/products${qs}`, {
      next: { revalidate: 300, tags: ['products'] },
    });
    return data.map(adaptProduct);
  },
  retrieve: async (term: string) => {
    const data = await fetchWrapper<BackendProduct>(`/products/${term}`, {
      next: { revalidate: 300, tags: ['products', `product-${term}`] },
    });
    return { product: adaptProduct(data) };
  },
};

export const orders = {
  create: async (data: any) => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  createGuest: async (data: any) => {
    const response = await api.post("/orders/guest", data);
    return response.data;
  },
  list: async () => {
    const response = await api.get("/orders");
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  }
};

export const auth = {
  login: async (email, password) => {
    // Assuming standard NestJS auth pattern or similar
    const response = await api.post("/auth/login", { email, password });
    return response.data; // Should return { access_token, user } or similar
  },
  me: async (token?: string) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get("/auth/profile", config);
    return response.data;
  },
  register: async (data: any) => {
    // Backend expects 'name' string, not first_name/last_name
    const payload = {
      email: data.email,
      password: data.password,
      name: `${data.first_name} ${data.last_name}`.trim(),
    };
    const response = await api.post("/users", payload);
    return response.data;
  },
  updateProfile: async (data: any) => {
    // Placeholder for profile update
    const response = await api.patch("/users/me", data);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", { token, password });
    return response.data;
  },
};

export const addresses = {
  create: async (data: any) => {
    // Map frontend fields to backend fields
    const payload = {
      street: data.address_1,
      city: data.city,
      state: data.province,
      zip: data.postal_code,
      country: "Colombia",
      phone: data.phone,
      company: data.company,
      first_name: data.first_name,
      last_name: data.last_name
    };
    const response = await api.post("/addresses", payload);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const payload = {
      street: data.address_1,
      city: data.city,
      state: data.province,
      zip: data.postal_code,
      country: "Colombia",
      phone: data.phone,
      company: data.company,
      first_name: data.first_name,
      last_name: data.last_name
    };
    const response = await api.patch(`/addresses/${id}`, payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  }
};

export const categories = {
  list: async (opts: { universeSlug?: string } = {}) => {
    const params = new URLSearchParams();
    if (opts.universeSlug) params.set('universeSlug', opts.universeSlug);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWrapper<BackendCategory[]>(`/categories${qs}`, {
      next: { revalidate: 300, tags: ['categories'] },
    });
    return data;
  }
};

export const universes = {
  list: async (opts: { activeOnly?: boolean } = {}) => {
    const params = new URLSearchParams();
    if (opts.activeOnly) params.set('activeOnly', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWrapper<BackendUniverse[]>(`/universes${qs}`, {
      next: { revalidate: 300, tags: ['universes'] },
    });
    return data;
  },
  retrieve: async (idOrSlug: string) => {
    const data = await fetchWrapper<BackendUniverse>(`/universes/${idOrSlug}`, {
      next: { revalidate: 300, tags: ['universes', `universe-${idOrSlug}`] },
    });
    return data;
  },
};

export const banners = {
  list: async (opts: { universeSlug?: string; universeId?: string; home?: boolean; activeOnly?: boolean } = {}) => {
    const params = new URLSearchParams();
    if (opts.universeSlug) params.set('universeSlug', opts.universeSlug);
    if (opts.universeId) params.set('universeId', opts.universeId);
    if (opts.home) params.set('home', 'true');
    if (opts.activeOnly) params.set('activeOnly', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWrapper<BackendBanner[]>(`/banners${qs}`, {
      next: { revalidate: 300, tags: ['banners'] },
    });
    return data;
  },
};

export const shipping = {
  calculate: async (data: { country: string; state?: string; city?: string }) => {
    const response = await api.post<{ id: string; price: number; country: string; state?: string; city?: string }>("/shipping/calculate", data);
    return response.data;
  }
};

export const discounts = {
  validate: async (code: string) => {
    const response = await api.get(`/discounts/validate/${code}`);
    return response.data;
  }
};

export const collections = {
  retrieve: async (id: string) => {
    const data = await fetchWrapper<BackendCollection>(`/collections/${id}`, {
      next: { revalidate: 300, tags: ['collections'] },
    });
    return {
      ...data,
      products: data.products.map(adaptProduct)
    };
  },
  retrieveBySlug: async (slug: string) => {
    const data = await fetchWrapper<BackendCollection>(`/collections/slug/${slug}`, {
      next: { revalidate: 300, tags: ['collections'] },
    });
    return {
      ...data,
      products: data.products.map(adaptProduct)
    };
  }
};
