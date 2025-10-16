import React, { useState } from "react";
import Image from "next/image";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "../../styles/ProductPopup.module.css";
import { useCart } from "../../context/CartContext";
import { useSession } from "next-auth/react";
import AuthPopup from "../auth/AuthPopup";
import CartToast from "../CartToast";

interface GalleryItem {
  thumbnail: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  discount?: number;
  gallery: GalleryItem[];
  colors?: string[];
  sizes?: string[];
  code?: string;
  status?: string;
}

interface ProductPopupProps {
  product: Product;
  onClose: () => void;
}

const ProductPopup: React.FC<ProductPopupProps> = ({ product, onClose }) => {
  const { data: session, status } = useSession();
  const { addToCart } = useCart();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!product) {
    return null;
  }

  const finalPrice = product.discount
    ? Math.round((product.price * (100 - product.discount)) / 100)
    : product.price;
  const productCode =
    product.code || `SP${String(product.id).padStart(5, "0")}`;
  const productStatus = product.status || "Còn hàng";

  const [mainIndex, setMainIndex] = useState(0);
  const prevImage = () => {
    setMainIndex((prev) => (prev > 0 ? prev - 1 : product.gallery.length - 1));
  };
  const nextImage = () => {
    setMainIndex((prev) => (prev < product.gallery.length - 1 ? prev + 1 : 0));
  };

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ""
  );

  const [quantity, setQuantity] = useState(1);
  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => q + 1);

  const handleAddToCart = async () => {
    if (status !== "authenticated" || !session) {
      setShowAuthPopup(true);
      return;
    }
    try {
      // addToCart: giả sử context cung cấp hàm addToCart(productId, qty)
      await addToCart(product.id, quantity);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      onClose();
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      alert("Có lỗi khi thêm vào giỏ!");
    }
  };

  return (
    <div className={styles.popupOverlay}>
      {showAuthPopup && (
        <AuthPopup
          show={true}
          setShow={() => setShowAuthPopup(false)}
          language="vi"
          translations={{
            vi: {
              loginTitle: "Đăng nhập",
              signupTitle: "Đăng ký",
            },
          }}
        />
      )}

      <div className={styles.popupContainer}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes size={20} />
        </button>

        <div className={styles.leftSide}>
          <div
            className={styles.mainImageContainer}
            style={{ position: "relative" }}
          >
            {product.gallery.length > 1 && (
              <button
                className={`${styles.arrowButton} ${styles.leftArrow}`}
                onClick={prevImage}
                aria-label="Prev image"
              >
                <FaChevronLeft />
              </button>
            )}
            <Image
              src={product.gallery[mainIndex].thumbnail}
              alt={product.title}
              fill
              className="object-cover rounded"
            />
            {product.gallery.length > 1 && (
              <button
                className={`${styles.arrowButton} ${styles.rightArrow}`}
                onClick={nextImage}
                aria-label="Next image"
              >
                <FaChevronRight />
              </button>
            )}
          </div>

          {product.gallery.length > 1 && (
            <div className={styles.thumbnails}>
              {product.gallery.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`${styles.thumbnailItem} ${
                    idx === mainIndex ? styles.active : ""
                  }`}
                >
                  <Image
                    src={item.thumbnail}
                    alt={`${product.title} - ${idx}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.rightSide}>
          <h2 className={styles.productTitle}>{product.title}</h2>
          <p className={styles.productMeta}>
            Mã sản phẩm: {productCode} | Tình trạng: {productStatus}
          </p>
          <p className={styles.price}>{finalPrice.toLocaleString("vi-VN")}₫</p>

          {product.colors && product.colors.length > 0 && (
            <div className={styles.colorSection}>
              <span className="label">Màu sắc:</span>
              <div className={styles.colorOptions}>
                {product.colors.map((hex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`${styles.colorOption} ${
                      selectedColorIndex === idx ? styles.selected : ""
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.sizeSection}>
              <span className="label">Kích thước:</span>
              <div className={styles.sizeOptions}>
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`${styles.sizeOption} ${
                      selectedSize === sz ? styles.selected : ""
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.quantitySection}>
            <span className="font-semibold mr-2">Số lượng:</span>
            <button onClick={decreaseQty} className={styles.quantityButton}>
              -
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button onClick={increaseQty} className={styles.quantityButton}>
              +
            </button>
          </div>

          <button className={styles.addCartButton} onClick={handleAddToCart}>
            THÊM VÀO GIỎ
          </button>
          <a href={`/products/${product.id}`} className={styles.detailLink}>
            Xem chi tiết sản phẩm
          </a>
        </div>
      </div>

      {showToast && (
        <CartToast
          message="Đã thêm vào giỏ hàng!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ProductPopup;
