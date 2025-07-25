import { createContext, useState, useEffect } from "react"

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([])

    // Load cart from localStorage on initial render
    useEffect(() => {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart))
            } catch (error) {
                console.error("Failed to parse cart from localStorage:", error)
                setCart([])
            }
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart))
    }, [cart])

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item.id === product.id)

            if (existingItemIndex >= 0) {
                // Item already exists in cart, update quantity
                const updatedCart = [...prevCart]
                const quantity = product.quantity || 1
                updatedCart[existingItemIndex].quantity += quantity
                return updatedCart
            } else {
                // Item doesn't exist in cart, add it
                return [...prevCart, { ...product, quantity: product.quantity || 1 }]
            }
        })
    }

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
    }

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return

        setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    }

    const clearCart = () => {
        setCart([])
    }

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    const getCartItemsCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0)
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartItemsCount,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}
