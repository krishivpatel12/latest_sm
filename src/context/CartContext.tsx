import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useNotification } from './NotificationContext';

// Define the CartItem interface
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Define the CartContextType interface
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  getTotalItems: () => number;
}

// Define the NotificationItem interface
interface NotificationItem {
  name: string;
  image: string;
  quantity: number;
  type: 'success' | 'error' | 'info';
}

// Create the CartContext
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the CartContext
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// CartProvider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { showNotification } = useNotification();

  // Use a ref to store pending notifications
  const pendingNotifications = useRef<NotificationItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        const updatedQuantity = existingItem.quantity + 1;
        // Store the notification to be shown later
        pendingNotifications.current.push({
          name: existingItem.name,
          image: existingItem.image,
          quantity: updatedQuantity,
          type: 'success',
        });
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: updatedQuantity } : i
        );
      }
      // Store the notification to be shown later
      pendingNotifications.current.push({
        name: item.name,
        image: item.image,
        quantity: 1,
        type: 'success',
      });
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      const updatedItem = updatedItems.find((item) => item.id === id);
      if (updatedItem) {
        pendingNotifications.current.push({
          name: updatedItem.name,
          image: updatedItem.image,
          quantity: updatedItem.quantity,
          type: 'success',
        });
      }
      return updatedItems;
    });
  };

  const decreaseQuantity = (id: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);
      const updatedItem = updatedItems.find((item) => item.id === id);
      if (updatedItem) {
        pendingNotifications.current.push({
          name: updatedItem.name,
          image: updatedItem.image,
          quantity: updatedItem.quantity,
          type: 'info',
        });
      }
      return updatedItems;
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    // Show all pending notifications after state update
    pendingNotifications.current.forEach((notif) => showNotification(notif));
    // Clear pending notifications
    pendingNotifications.current = [];
  }, [cartItems, showNotification]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 