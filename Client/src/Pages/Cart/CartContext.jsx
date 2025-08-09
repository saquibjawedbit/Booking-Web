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
    console.log("Trying to add product to cart:", product)

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item._id === product._id
      )

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart]
        const quantity = product.quantity || 1
        updatedCart[existingItemIndex].quantity += quantity
        console.log("Updated quantity in cart:", updatedCart)
        return updatedCart
      } else {
        const newItem = {
          ...product,
          quantity: product.quantity || 1,
        }
        console.log("Added new item to cart:", newItem)
        return [...prevCart, newItem]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item._id !== productId)
    )
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    )
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
console.log("Cart",cart)
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
