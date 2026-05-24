import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Cart } from '../types';
import * as cartApi from '../api/cartApi';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);

  const fetchCart = async () => {
    try {
      const res = await cartApi.getCart();
      setCart(res.data);
    } catch { setCart(null); }
  };

  const addItem = async (productId: number, quantity: number) => {
    const res = await cartApi.addToCart(productId, quantity);
    setCart(res.data);
  };

  const removeItem = async (itemId: number) => {
    const res = await cartApi.removeCartItem(itemId);
    setCart(res.data);
  };

  const clearCart = async () => {
    await cartApi.clearCart();
    setCart(null);
  };

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
