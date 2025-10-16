import { useState, useEffect, useRef } from "react";
import CartPopup from "./CartPopup";
import { useCart } from "../context/CartContext";

const CartIcon = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartPopupRef = useRef<HTMLDivElement>(null);

  // ✅ Lấy tổng số lượng từ cart trong context
  const { cart } = useCart();
  const totalQuantity = cart?.totalQuantity ?? 0;

  // ✅ Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartPopupRef.current &&
        !cartPopupRef.current.contains(event.target as Node)
      ) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen]);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative focus:outline-none"
        >
          <img
            src="/images/icon/carticon.png"
            alt="Giỏ hàng"
            width={25}
            height={25}
            className="w-8 h-8 object-contain bg-transparent border-none"
          />
          {/* ✅ Hiển thị số lượng sản phẩm trong giỏ */}
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 min-w-[18px] text-center">
              {totalQuantity}
            </span>
          )}
        </button>
      </div>

      {/* ✅ Popup giỏ hàng */}
      {isCartOpen && (
        <div ref={cartPopupRef}>
          <CartPopup onClose={() => setIsCartOpen(false)} />
        </div>
      )}
    </>
  );
};

export default CartIcon;
