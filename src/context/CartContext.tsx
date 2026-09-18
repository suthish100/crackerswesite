'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, Package } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, sourcePackage?: { id: number; name: string }) => void;
  addPackageToCart: (pkg: Package, customizedItems?: { product: Product; quantity: number }[]) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crackers_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('crackers_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity = 1, sourcePackage?: { id: number; name: string }) => {
    setItems((prev) => {
      const cartItemId = sourcePackage
        ? `pkg-${sourcePackage.id}-p-${product.id}`
        : `prod-${product.id}`;

      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty > product.stockQty ? product.stockQty : newQty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          product,
          quantity: quantity > product.stockQty ? product.stockQty : quantity,
          unitPrice: product.price,
          sourcePackageId: sourcePackage ? sourcePackage.id : null,
          sourcePackageName: sourcePackage ? sourcePackage.name : null,
        },
      ];
    });
    // Keep the catalog visible while adding products; the basket panel can be
    // opened from the basket button (and stays visible on desktop).
  };

  const addPackageToCart = (
    pkg: Package,
    customizedItems?: { product: Product; quantity: number }[]
  ) => {
    const itemsToAdd = customizedItems || pkg.items?.map(i => ({ product: i.product, quantity: i.defaultQty })) || [];
    
    setItems((prev) => {
      let updated = [...prev];
      itemsToAdd.forEach(({ product, quantity }) => {
        if (quantity <= 0) return;
        const cartItemId = `pkg-${pkg.id}-p-${product.id}`;
        const existingIndex = updated.findIndex((item) => item.cartItemId === cartItemId);
        if (existingIndex > -1) {
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty > product.stockQty ? product.stockQty : newQty,
          };
        } else {
          updated.push({
            cartItemId,
            productId: product.id,
            product,
            quantity: quantity > product.stockQty ? product.stockQty : quantity,
            unitPrice: product.price,
            sourcePackageId: pkg.id,
            sourcePackageName: pkg.name,
          });
        }
      });
      return updated;
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const maxQty = item.product.stockQty;
          return { ...item, quantity: Math.min(quantity, maxQty) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addPackageToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalAmount,
        totalItemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
