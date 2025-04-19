import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description?: string;  // Making it optional to maintain backward compatibility
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  submitOffer: (contactInfo: ContactInfo) => Promise<string>;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { currentUser } = useAuth();

  // Load cart from localStorage on first render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Ensure all items have the required fields
        const validatedCart = parsedCart.map((item: CartItem) => ({
          ...item,
          image: item.image || '', // Ensure image field exists
          description: item.description || '' // Ensure description field exists
        }));
        setCartItems(validatedCart);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('Saving cart items:', cartItems); // Debug log
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    console.log('CartContext - Adding item:', item); // Debug log
    setCartItems(prevItems => {
      console.log('CartContext - Previous items:', prevItems); // Debug log
      const existingItemIndex = prevItems.findIndex(i => i.productId === item.productId);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = prevItems.map((cartItem, index) => {
          if (index === existingItemIndex) {
            const newItem = {
              ...cartItem,
              quantity: cartItem.quantity + item.quantity
            };
            console.log('CartContext - Updated existing item:', newItem); // Debug log
            return newItem;
          }
          return cartItem;
        });
        console.log('CartContext - Updated items:', updatedItems); // Debug log
        return updatedItems;
      } else {
        // Add new item
        const newItem = { ...item, id: Date.now().toString() };
        const newItems = [...prevItems, newItem];
        console.log('CartContext - Added new item:', newItem); // Debug log
        console.log('CartContext - New items array:', newItems); // Debug log
        return newItems;
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOffer = async (contactInfo: ContactInfo) => {
    try {
      const offerData = {
        userId: currentUser?.uid || 'anonymous',
        userEmail: currentUser?.email || contactInfo.email,
        contactInfo,
        items: cartItems,
        totalPrice: getTotalPrice(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const offersCollection = db.collection('offers');
      const docRef = await db.addDoc(offersCollection, offerData);
      
      clearCart();
      return docRef.id;
    } catch (error) {
      console.error('Error submitting offer:', error);
      throw error;
    }
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    submitOffer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
