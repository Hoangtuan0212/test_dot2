import React from "react";
import { useSession } from "next-auth/react";
import { useCart } from "../context/CartContext";
import AuthPopup from "./auth/AuthPopup";
import styles from "../styles/cartPopup.module.css";
import { useRouter } from "next/router";

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

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface CartPopupProps {
  onClose: () => void;
}

export default function CartPopup({ onClose }: CartPopupProps) {
  const { data: session, status } = useSession();
  const { cart, removeCartItem, updateCartItem } = useCart();
  const router = useRouter();

  if (status !== "authenticated") {
    return (
      <AuthPopup
        show={true}
        setShow={onClose}
        language="vi"
        translations={{
          vi: {
            loginTitle: "Đăng nhập",
            signupTitle: "Đăng ký",
          },
        }}
      />
    );
  }

  // Nếu cart chưa có (trong trường hợp rất ngắn khi loading), hiển thị loading
  if (!cart) {
    return <div>Đang tải giỏ hàng...</div>;
  }

  // an toàn: luôn có mảng items
  const items: CartItem[] = (cart as any).cartItems ?? [];

  // Tính tổng tiền (an toàn với dữ liệu chưa đầy đủ)
  const totalPrice = items.reduce((acc, item) => {
    const product = item?.product;
    if (!product) return acc;
    const price = product.price ?? 0;
    const discount = product.discount ?? 0;
    const finalPrice = discount
      ? Math.round((price * (100 - discount)) / 100)
      : price;
    return acc + finalPrice * (item.quantity ?? 0);
  }, 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.cartPopup}>
        {/* Nút đóng popup */}
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {/* Tiêu đề */}
        <h2 className={styles.title}>Giỏ hàng</h2>
        <p className={styles.freeShippingNotice}>
          Bạn đã được miễn phí vận chuyển
        </p>

        {/* Phần nội dung giỏ hàng cuộn được */}
        <div className={styles.cartContent}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <img src="/images/icon/emptycart.png" alt="Giỏ hàng trống" />
              <p>Chưa có sản phẩm trong giỏ hàng...</p>
              <a href="/products" className="text-blue-500 hover:underline">
                Trở về trang sản phẩm
              </a>
            </div>
          ) : (
            <ul className={styles.cartList}>
              {items.map((item: CartItem) => {
                const product = item.product;
                if (!product) return null;

                const mainImage = product.thumbnail || "/images/placeholder.png";
                const color =
                  product.colors && product.colors.length > 0
                    ? product.colors[0]
                    : "N/A";
                const size =
                  product.sizes && product.sizes.length > 0
                    ? product.sizes[0]
                    : "N/A";
                const finalPrice = product.discount
                  ? Math.round((product.price * (100 - product.discount)) / 100)
                  : product.price;

                return (
                  <li key={item.id} className={styles.cartItem}>
                    <img
                      src={mainImage}
                      alt={product.title}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>{product.title}</p>
                      <p className={styles.itemVariants}>
                        Màu: {color} / Size: {size}
                      </p>
                      <p className={styles.itemPrice}>
                        {finalPrice.toLocaleString("vi-VN")}₫
                      </p>
                      <div className={styles.quantityControls}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            updateCartItem(item.id, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeCartItem(item.id)}
                    >
                      ❌
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Phần thanh toán cố định ở dưới cùng */}
        {items.length > 0 && (
          <div className={styles.checkoutSection}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Tổng tiền:</span>
              <span className={styles.totalValue}>
                {totalPrice.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <button className={styles.checkoutButton}>THANH TOÁN</button>
            <button
              className={styles.viewCartButton}
              onClick={() => {
                onClose();
                router.push("/cart");
              }}
            >
              Xem giỏ hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
