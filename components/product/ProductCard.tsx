import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { useSession } from "next-auth/react";
import AuthPopup from "../auth/AuthPopup";
import styles from "../../styles/ProductCard.module.css";

interface GalleryItem {
  thumbnail: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  discount?: number;
  gallery: GalleryItem[];
  colors?: string[];
  sizes?: string[];
  rating?: number;
}

type Variant = "default" | "compact";

interface ProductCardProps {
  product: Product;
  onOpenPopup: (product: Product) => void;
  variant?: Variant;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenPopup,
  variant = "default",
  className = "",
}) => {
  const { data: session } = useSession();
  const [showAuth, setShowAuth] = useState(false);

  // Lấy ảnh chính và ảnh hover
  const mainImage = product.gallery?.[0]?.thumbnail || "/placeholder.png";
  const hoverImage = product.gallery?.[1]?.thumbnail || mainImage;

  const finalPrice = product.discount
    ? Math.round((product.price * (100 - product.discount)) / 100)
    : product.price;
  const rating = product.rating || 5;

  const handleAddToCart = () => {
    if (!session) {
      setShowAuth(true);
      return;
    }
    onOpenPopup(product);
  };

  const imageHeight = variant === "compact" ? 180 : 320;

  return (
    <div
      className={`${styles.productCard} ${
        variant === "compact" ? styles.compact : ""
      } ${className}`}
      role="article"
    >
      {/* --- VÙNG ẢNH --- */}
      <div
        className={styles.imageWrapper}
        style={{ height: `${imageHeight}px` }}
      >
        <div className={styles.imageSlide}>
          <div className={styles.imageContainer}>
            <Image
              src={mainImage}
              alt={product.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={styles.imageContainer}>
            <Image
              src={hoverImage}
              alt={`${product.title} hover`}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Overlay 👁 */}
        <div className={styles.hoverOverlay}>
          <button
            onClick={() => onOpenPopup(product)}
            className={styles.quickViewBtn}
            aria-label="Quick view"
          >
            👁
          </button>
        </div>
      </div>

      {/* --- THÔNG TIN SẢN PHẨM --- */}
      <div className={styles.infoSection}>
        <div className={styles.topRow}>
          {product.colors && product.colors.length > 0 && (
            <div className={styles.colorRow}>
              {product.colors.slice(0, 3).map((color, idx) => (
                <span
                  key={idx}
                  className={styles.colorDot}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
          {product.sizes && product.sizes.length > 0 && (
            <span className={styles.sizeLabel}>
              +{product.sizes.length} Kích thước
            </span>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <h2 className={styles.productTitle}>{product.title}</h2>
        </Link>

        {variant !== "compact" ? (
          <>
            <div className={styles.ratingRow}>
              {Array.from({ length: rating }).map((_, i) => (
                <span key={i}>★</span>
              ))}
              <span className={styles.ratingCount}>({rating})</span>
            </div>

            <p className={styles.price}>
              {finalPrice.toLocaleString("vi-VN")}₫
            </p>

            <button onClick={handleAddToCart} className={styles.addCartBtn}>
              <span>THÊM VÀO GIỎ</span>
              <FaShoppingCart className="w-4 h-4" />
            </button>
          </>
        ) : (
          <p className={styles.priceCompact}>
            {finalPrice.toLocaleString("vi-VN")}₫
          </p>
        )}
      </div>

      {showAuth && (
        <AuthPopup
          show={true}
          setShow={() => setShowAuth(false)}
          language="vi"
          translations={{
            vi: {
              loginTitle: "Đăng nhập",
              signupTitle: "Đăng ký",
            },
          }}
        />
      )}
    </div>
  );
};

export default ProductCard;
