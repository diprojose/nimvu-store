import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://nimvu-be-nest.onrender.com" : "http://localhost:3001");

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const storage = localStorage.getItem('nimvu-auth-storage');
  if (storage) {
    const { state } = JSON.parse(storage);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

export interface BackendProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  width?: number; // Added
  length?: number; // Added
  height?: number; // Added
  longDescription?: string; // Added
  variants?: BackendVariant[];
}

export interface BackendVariant {
  id: string;
  productId: string;
  name: string;
  stock: number;
  price: number | null;
  images: string[];
  sku: string;
}

// Frontend interfaces based on what I saw in page.tsx
export interface FrontendProduct {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  images: { id: string; url: string }[];
  variants: { id: string; title: string; inventory_quantity: number; price?: number; images?: string[] }[]; // Added images to variant
  dimensions?: { width: number; height: number; length: number }; // Added
  longDescription?: string; // Added
  // Add other fields as necessary based on usage
}

// Adapter to transform BackendProduct to FrontendProduct
const adaptProduct = (product: BackendProduct): FrontendProduct => {
  return {
    id: product.id,
    title: product.name,
    description: product.description || "",
    thumbnail: product.images[0] || "",
    price: product.price,
    images: product.images.map((url, index) => ({
      id: `${product.id}-img-${index}`,
      url: url,
    })),
    variants: product.variants?.map((v) => ({
      id: v.id,
      title: v.name,
      inventory_quantity: v.stock,
      price: v.price || product.price, // Fallback to product price if variant price is null
      images: v.images, // Pass variant images
    })) || [],
    dimensions: {
      width: product.width || 0,
      height: product.height || 0,
      length: product.length || 0,
    },
    longDescription: product.longDescription || "",
  };
};

export const products = {
  list: async () => {
    const response = await api.get<BackendProduct[]>("/products");
    return response.data.map(adaptProduct);
  },
  retrieve: async (id: string) => {
    const response = await api.get<BackendProduct>(`/products/${id}`);
    return { product: adaptProduct(response.data) };
  },
};

export const orders = {
  create: async (data: any) => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  list: async () => {
    const response = await api.get("/orders");
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
    // If token is needed, we might need to intercept request or pass it.
    // For simplicity, assuming session or token handling is managed or we return mock/stored user.
    const response = await api.get("/auth/profile"); // or /users/me
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
  }
};

export const addresses = {
  create: async (data: any) => {
    // Map frontend fields to backend fields
    const payload = {
      street: data.address_1,
      city: data.city,
      state: data.province,
      zip: data.postal_code,
      country: data.country_code || "Colombia",
      phone: data.phone,
    };
    const response = await api.post("/addresses", payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  }
};
