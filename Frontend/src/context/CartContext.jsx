import React, { createContext, useContext, useState, useMemo } from "react";

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [restaurant, setRestaurant] = useState(null);

    const addToCart = (item, restaurantInfo) => {
        setRestaurant(restaurantInfo);

        setCartItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (id, amount) => {
        setCartItems((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? { ...item, quantity: item.quantity + amount }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // New function to remove an item completely
    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        // If cart becomes empty, also clear restaurant info
        if (cartItems.length === 1) setRestaurant(null);
    };

    const clearCart = () => {
        setCartItems([]);
        setRestaurant(null);
    };

    const cartTotal = useMemo(() => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    }, [cartItems]);

    const itemsCount = useMemo(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    const getItemQuantity = (itemId) => {
        const item = cartItems.find((i) => i.id === itemId);
        return item ? item.quantity : 0;
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                restaurant,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                cartTotal,
                itemsCount,
                getItemQuantity,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};