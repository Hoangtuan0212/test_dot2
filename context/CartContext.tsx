import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import CartToast from "../components/CartToast";

// Định nghĩa interfaces
interface Product {
  id: number;
  title: string;
  price: number;
  discount?: number;
  thumbnail?: string;
  colors?: string[];
  sizes?: string[];
  code?: string;
  status?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  cartItems: CartItem[]; // <-- ĐỒNG BỘ: cartItems (camelCase)
  totalQuantity: number;
}

interface CartContextProps {
  cart: Cart;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
}

// Tạo context mặc định
const CartContext = createContext<CartContextProps>({
  cart: { cartItems: [], totalQuantity: 0 },
  fetchCart: async () => {},
  addToCart: async () => {},
  removeCartItem: async () => {},
  updateCartItem: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart>({ cartItems: [], totalQuantity: 0 });
  const [showToast, setShowToast] = useState(false);

  // Đảm bảo axios gửi cookie kèm theo request
  axios.defaults.withCredentials = true;

  // Debug log
  // console.log("CartContext => session:", session);
  // console.log("CartContext => status:", status);

  const fetchCart = async () => {
    // Chỉ fetch khi đã xác thực
    if (status !== "authenticated" || !session) {
      setCart({ cartItems: [], totalQuantity: 0 });
      return;
    }

    try {
      console.log("fetchCart => Gọi GET /api/cart");
      const res = await axios.get("/api/cart", { withCredentials: true });
      console.log("fetchCart => Kết quả:", res.data);

      // Sử dụng cartItems (camelCase) - đồng bộ với backend
      const cartItems = res.data?.cartItems ?? [];
      const totalQuantity = typeof res.data?.totalQuantity === "number" ? res.data.totalQuantity : cartItems.reduce((s: number, it: CartItem) => s + (it.quantity || 0), 0);

      setCart({
        cartItems,
        totalQuantity,
      });
    } catch (error: any) {
      // Log chi tiết để debug (bao gồm response body nếu có)
      console.error("Lỗi fetchCart:", error?.response?.data ?? error?.message ?? error);
      // Nếu muốn, bạn có thể show toast lỗi ở đây
      setCart({ cartItems: [], totalQuantity: 0 });
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    if (status !== "authenticated" || !session) {
      console.error("addToCart => Chưa đăng nhập, không gọi API");
      return;
    }
    try {
      console.log("addToCart => Gọi POST /api/cart với productId:", productId, "và quantity:", quantity);
      await axios.post(
        "/api/cart",
        { productId, quantity },
        { withCredentials: true }
      );
      console.log("addToCart => POST thành công, gọi fetchCart");
      await fetchCart();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (error: any) {
      console.error("Lỗi addToCart:", error?.response?.data ?? error?.message ?? error);
    }
  };

  const removeCartItem = async (cartItemId: number) => {
    if (status !== "authenticated" || !session) {
      console.error("removeCartItem => Chưa đăng nhập, không gọi API");
      return;
    }

    try {
      console.log("removeCartItem => Gọi DELETE /api/cart/", cartItemId);
      await axios.delete(`/api/cart/${cartItemId}`, { withCredentials: true });
      console.log("removeCartItem => DELETE thành công, gọi fetchCart");
      await fetchCart();
    } catch (error: any) {
      console.error("Lỗi removeCartItem:", error?.response?.data ?? error?.message ?? error);
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    if (status !== "authenticated" || !session) {
      console.error("updateCartItem => Chưa đăng nhập, không gọi API");
      return;
    }

    try {
      console.log("updateCartItem => Gọi PATCH /api/cart/", cartItemId, "với quantity:", quantity);
      await axios.patch(
        `/api/cart/${cartItemId}`,
        { quantity },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log("updateCartItem => PATCH thành công, gọi fetchCart");
      await fetchCart();
    } catch (error: any) {
      console.error("Lỗi updateCartItem:", error?.response?.data ?? error?.message ?? error);
    }
  };

  // Chỉ chạy fetch khi status chuyển sang authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    } else if (status === "unauthenticated") {
      // reset cart khi logout
      setCart({ cartItems: [], totalQuantity: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        addToCart,
        removeCartItem,
        updateCartItem,
      }}
    >
      {children}
      {showToast && (
        <CartToast
          message="Đã thêm vào giỏ hàng!"
          onClose={() => setShowToast(false)}
        />
      )}
    </CartContext.Provider>
  );
};

export default CartProvider;
