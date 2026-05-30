"use client";

const CART_KEY = "scm_cart";

export interface CartItem {
  stock_id: number;
  name: string;
  price: number;
  amount: number;
  maxCount: number;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  }
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((c) => c.stock_id === item.stock_id);
  if (existing) {
    existing.amount = Math.min(existing.amount + item.amount, item.maxCount);
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function removeFromCart(stock_id: number) {
  saveCart(getCart().filter((c) => c.stock_id !== stock_id));
}

export function updateCartItem(stock_id: number, amount: number) {
  const cart = getCart();
  const item = cart.find((c) => c.stock_id === stock_id);
  if (item) {
    item.amount = amount;
    saveCart(cart);
  }
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.amount, 0);
}

export function cartCount(): number {
  return getCart().reduce((sum, item) => sum + item.amount, 0);
}
