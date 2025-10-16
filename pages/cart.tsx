import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useCart } from "../context/CartContext";
import ProductPopup from "../components/product/ProductPopup";
import styles from "../styles/CartPage.module.css";

interface Product {
  id: number;
  title: string;
  price: number;
  discount?: number;
  thumbnail?: string;
  gallery?: { thumbnail: string }[];
  colors?: string[];
  sizes?: string[];
  rating?: number;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product | null;
}

export interface Cart {
  cartItems: CartItem[]; // đồng bộ với CartContext
  totalQuantity: number;
}

interface SuggestedProduct extends Product {}

export default function CartPage() {
  const { cart, removeCartItem, updateCartItem, addToCart } = useCart();
  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch sản phẩm gợi ý từ API (/api/products?limit=4)
  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await axios.get("/api/products?limit=4", {
          withCredentials: true,
        });
        // Hỗ trợ 2 dạng response: { products, pagination } hoặc mảng trực tiếp
        const data = res.data;
        const prods = data?.products ?? (Array.isArray(data) ? data : []);
        setSuggestions(prods);
      } catch (error) {
        console.error("Lỗi fetchSuggestions:", error);
        setSuggestions([]);
      }
    }
    fetchSuggestions();
  }, []);

  // Nếu giỏ hàng trống, hiển thị thông báo
  if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <h2>Giỏ hàng của bạn trống</h2>
        <Link href="/products">
          <span className={styles.shopNowButton}>Mua sắm ngay</span>
        </Link>
      </div>
    );
  }

  // Tính tổng tiền (áp dụng discount nếu có)
  const totalPrice = cart.cartItems.reduce((acc, item) => {
    const product = item.product;
    if (!product) return acc;
    let price = product.price;
    if (product.discount && product.discount > 0) {
      price = Math.round((product.price * (100 - product.discount)) / 100);
    }
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className={styles.cartPageContainer}>
      {/* Thanh thông báo */}
      <div className={styles.notificationBar}>
        <p>
          Bạn đang có <strong>{cart.totalQuantity}</strong> sản phẩm trong giỏ
          hàng.
        </p>
        <p>Miễn phí vận chuyển khi mua từ 1,000,000₫</p>
      </div>

      {/* Nội dung chính chia 2 cột */}
      <div className={styles.mainContent}>
        {/* Cột trái: danh sách sản phẩm */}
        <div className={styles.leftColumn}>
          <h2>Giỏ hàng của bạn</h2>
          <ul className={styles.cartList}>
            {cart.cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;
              const mainImage = product.thumbnail || "/images/placeholder.png";
              const price =
                product.discount && product.discount > 0
                  ? Math.round((product.price * (100 - product.discount)) / 100)
                  : product.price;
              return (
                <li key={item.id} className={styles.cartItem}>
                  <img
                    src={mainImage}
                    alt={product.title}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{product.title}</h3>
                    <p className={styles.itemPrice}>
                      {price.toLocaleString("vi-VN")}₫
                    </p>
                    <div className={styles.quantityWrapper}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateCartItem(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateCartItem(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeCartItem(item.id)}
                  >
                    ❌
                  </button>
                </li>
              );
            })}
          </ul>
          <div className={styles.noteSection}>
            <label htmlFor="orderNote">Ghi chú đơn hàng:</label>
            <textarea
              id="orderNote"
              placeholder="Nhập ghi chú cho đơn hàng..."
            ></textarea>
          </div>
        </div>

        {/* Cột phải: Thông tin đơn hàng */}
        <div className={styles.rightColumn}>
          <div className={styles.orderSummary}>
            <h3>Thông tin đơn hàng</h3>
            <div className={styles.summaryRow}>
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Phí vận chuyển:</span>
              <span>Miễn phí</span>
            </div>
            <div className={styles.summaryRow}>
              <strong>Tổng tiền:</strong>
              <strong>{totalPrice.toLocaleString("vi-VN")}₫</strong>
            </div>
            <button className={styles.checkoutBtn}>THANH TOÁN</button>
          </div>
        </div>
      </div>

      {/* Phần sản phẩm gợi ý */}
      <div className={styles.suggestionSection}>
        <h3>Có thể bạn sẽ thích</h3>
        <div className={styles.suggestionGrid}>
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((prod) => {
              const prodPrice =
                prod.discount && prod.discount > 0
                  ? Math.round((prod.price * (100 - prod.discount)) / 100)
                  : prod.price;
              const rating = prod.rating || 5;
              // Lấy ảnh chính và ảnh hover tương tự như ProductCard
              const mainImage =
                prod.gallery && prod.gallery[0]
                  ? prod.gallery[0].thumbnail
                  : prod.thumbnail || "/images/placeholder.png";
              const hoverImage =
                prod.gallery && prod.gallery[1]
                  ? prod.gallery[1].thumbnail
                  : mainImage;
              return (
                <div key={prod.id} className={styles.suggestionItem}>
                  <div className={styles.suggestionImageWrapper}>
                    <img
                      src={mainImage}
                      alt={prod.title}
                      className={`${styles.suggestionImage} ${styles.mainImage}`}
                    />
                    {/* ảnh hover: CSS sẽ handle translateX on hover */}
                    {prod.gallery && prod.gallery.length > 1 && (
                      <img
                        src={hoverImage}
                        alt={`${prod.title} - hover`}
                        className={`${styles.suggestionImage} ${styles.hoverImage}`}
                      />
                    )}

                    {/* overlay eye (CSS .hoverOverlay điều khiển opacity on hover) */}
                    <div className={styles.hoverOverlay}>
                      <button
                        className={styles.quickViewBtn}
                        onClick={() => setSelectedProduct(prod)}
                      >
                        👁
                      </button>
                    </div>
                  </div>

                  <div className={styles.infoSection}>
                    <div className={styles.topRow}>
                      {prod.colors && prod.colors.length > 0 && (
                        <div className={styles.colorRow}>
                          {prod.colors.slice(0, 3).map((color, idx) => (
                            <span
                              key={idx}
                              className={styles.colorDot}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                      {prod.sizes && prod.sizes.length > 0 && (
                        <span className={styles.sizeLabel}>
                          +{prod.sizes.length} Kích thước
                        </span>
                      )}
                    </div>
                    <Link href={`/products/${prod.id}`}>
                      <span className={styles.productTitle}>{prod.title}</span>
                    </Link>
                    <div className={styles.ratingRow}>
                      {Array.from({ length: rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      <span className={styles.ratingCount}>({rating})</span>
                    </div>
                    <p className={styles.price}>
                      {prodPrice.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Không có sản phẩm gợi ý.</p>
          )}
        </div>
      </div>

      {/* ProductPopup hiển thị khi có sản phẩm được chọn */}
      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      )}
    </div>
  );
}
