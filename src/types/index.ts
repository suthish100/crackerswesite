export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

export interface Product {
  id: number;
  categoryId: number;
  category?: Category;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  originalPrice: number | null;
  price: number;
  stockQty: number;
  imageUrl: string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PackageItem {
  id: number;
  packageId: number;
  productId: number;
  product: Product;
  defaultQty: number;
}

export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  basePrice: number;
  isActive: boolean;
  items?: PackageItem[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CartItem {
  cartItemId: string; // unique identifier for item in cart (product_id or pkg_product_id)
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  sourcePackageId?: number | null;
  sourcePackageName?: string | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  sourcePackageId: number | null;
  sourcePackage?: Package | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: string;
  note: string | null;
  changedAt: Date | string;
}

export interface Order {
  id: number;
  publicOrderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string | null;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}
