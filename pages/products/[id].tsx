import React, { useState } from "react";
import Image from "next/image";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import { useCart } from "../../context/CartContext";
import styles from "../../styles/ProductDetail.module.css";
import Link from "next/link";
import ProductPopup from "../../components/product/ProductPopup";
import ProductCard from "../../components/product/ProductCard"; // <-- dùng lại ProductCard

interface Gallery {
  id: number;
  thumbnail: string;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discount: number;
  thumbnail: string;
  gallery: Gallery[];
  colors?: string[];
  sizes?: string[];
  rating?: number;
}

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  reviews: Review[];
}

const ProductDetailPage: React.FC<ProductDetailProps> = ({
  product,
  relatedProducts,
  reviews: initialReviews,
}) => {
  const { addToCart } = useCart();

  // Các state cho thông tin sản phẩm
  const [mainIndex, setMainIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : ""
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ""
  );

  // State cho sản phẩm liên quan (hover & quick view)
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // State cho review
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [hoverStar, setHoverStar] = useState(0);

  // Giả lập userId = 1 (user đã đăng nhập)
  const userId = 1;

  const finalPrice = product.discount
    ? Math.round((product.price * (100 - product.discount)) / 100)
    : product.price;

  // Thông báo khi thêm giỏ
  const [showNotification, setShowNotification] = useState(false);
  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    alert("Đi tới trang thanh toán...");
  };

  const handleSubmitReview = async () => {
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId,
          rating: newReviewRating,
          comment: newReviewComment,
        }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        alert("Lỗi: " + error);
        return;
      }
      const res2 = await fetch(`/api/products/${product.id}`);
      if (!res2.ok) {
        alert("Không thể cập nhật review, vui lòng reload trang!");
        return;
      }
      const data = await res2.json();
      if (data && data.reviews) {
        setReviews(data.reviews);
      }
      setShowReviewForm(false);
      setNewReviewRating(5);
      setNewReviewComment("");
      setHoverStar(0);
      alert("Gửi đánh giá thành công!");
    } catch (err) {
      console.error("Lỗi fetch:", err);
      alert("Có lỗi xảy ra khi gửi đánh giá!");
    }
  };

  return (
    <div className={styles.container}>
      {/* Thông báo thêm giỏ */}
      {showNotification && (
        <div className={styles.notification}>
          Đã thêm vào giỏ hàng thành công!
        </div>
      )}

      <div className={styles.topSection}>
        {/* Ảnh trái */}
        <div className={styles.leftCol}>
          <div className={styles.mainImage}>
            {product.gallery && product.gallery.length > 0 ? (
              <Image
                src={product.gallery[mainIndex].thumbnail}
                alt={product.title}
                width={500}
                height={500}
                className={styles.mainImageImg}
              />
            ) : (
              <Image
                src="/images/placeholder.png"
                alt="Placeholder"
                width={500}
                height={500}
                className={styles.mainImageImg}
              />
            )}
          </div>
          <div className={styles.thumbnailRow}>
            {product.gallery?.map((img, idx) => (
              <div
                key={img.id}
                className={`${styles.thumbnailItem} ${
                  idx === mainIndex ? styles.active : ""
                }`}
                onClick={() => setMainIndex(idx)}
              >
                <Image
                  src={img.thumbnail || "/images/placeholder.png"}
                  alt={`${product.title} - ${idx}`}
                  width={70}
                  height={70}
                  className={styles.thumbnailImg}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className={styles.rightCol}>
          <h1 className={styles.productTitle}>{product.title}</h1>
          <div className={styles.ratingRow}>
            <span className={styles.stars}>★★★★☆</span>
            <span className={styles.reviewCount}>4.8 (8 đánh giá)</span>
          </div>
          <div className={styles.promoBanner}>
            <p>
              Giảm 10% khi thanh toán qua Fundiin. <a href="#">Xem chi tiết</a>
            </p>
          </div>
          <p className={styles.price}>{finalPrice.toLocaleString("vi-VN")} đ</p>
          {product.colors && product.colors.length > 0 && (
            <div className={styles.colorSection}>
              <label>Màu sắc:</label>
              <div className={styles.colorOptions}>
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    style={{ backgroundColor: color }}
                    className={`${styles.colorSwatch} ${
                      selectedColor === color ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          )}
          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.sizeSection}>
              <label>Kích thước:</label>
              <div className={styles.sizeOptions}>
                {product.sizes.map((sz, idx) => (
                  <button
                    key={idx}
                    className={`${styles.sizeBtn} ${
                      selectedSize === sz ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={styles.quantityRow}>
            <label>Số lượng:</label>
            <div className={styles.quantityControl}>
              <button
                onClick={() =>
                  setQuantity((prev) => (prev > 1 ? prev - 1 : prev))
                }
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
            </div>
          </div>
          <div className={styles.sizeGuide}>
            <a href="#">Hướng dẫn chọn size</a>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.addToCartBtn} onClick={handleAddToCart}>
              Thêm vào giỏ
            </button>
            <button className={styles.buyNowBtn} onClick={handleBuyNow}>
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      <div className={styles.descriptionSection}>
        <h2>Mô tả sản phẩm</h2>
        <p>{product.description}</p>
      </div>

      {/* REVIEW */}
      <div className={styles.reviewSection}>
        <h2>Nhận xét</h2>
        <div className={styles.reviewSummary}>
          <span className={styles.stars}>★★★★★</span>
          <span className={styles.reviewCount}>
            5 ( {reviews.length} đánh giá )
          </span>
          <button
            className={styles.writeReviewBtn}
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            Viết đánh giá
          </button>
        </div>
        <div className={styles.reviewList}>
          {reviews.map((rev) => (
            <div key={rev.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewAuthor}>{rev.author}</span>
                <span className={styles.reviewRating}>
                  {"★".repeat(rev.rating)}
                </span>
              </div>
              <p className={styles.reviewComment}>{rev.comment}</p>
              <div className={styles.reviewDate}>{rev.date}</div>
            </div>
          ))}
        </div>
        {showReviewForm && (
          <div style={{ marginTop: "20px" }}>
            <h3>Gửi đánh giá mới</h3>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Chọn số sao:
            </label>
            <div style={{ marginBottom: "8px" }}>
              {[1, 2, 3, 4, 5].map((starValue) => (
                <span
                  key={starValue}
                  style={{
                    cursor: "pointer",
                    fontSize: "24px",
                    color:
                      starValue <= (hoverStar || newReviewRating)
                        ? "#ffc107"
                        : "#e4e5e9",
                  }}
                  onClick={() => setNewReviewRating(starValue)}
                  onMouseEnter={() => setHoverStar(starValue)}
                  onMouseLeave={() => setHoverStar(newReviewRating)}
                >
                  ★
                </span>
              ))}
            </div>
            <label>Nội dung bình luận:</label>
            <textarea
              rows={3}
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              style={{ width: "100%", marginTop: "4px" }}
            />
            <button style={{ marginTop: "8px" }} onClick={handleSubmitReview}>
              Gửi đánh giá
            </button>
          </div>
        )}
      </div>

      {/* Sản phẩm liên quan - sử dụng ProductCard để đồng bộ giao diện */}
      <div className={styles.relatedSection}>
        <h2>Sản phẩm liên quan</h2>

        <div
          className={styles.productCardSection}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {relatedProducts.map((rp) => {
            const gallery =
              rp.gallery && rp.gallery.length
                ? rp.gallery
                : rp.thumbnail
                ? [{ id: 0, thumbnail: rp.thumbnail }]
                : [{ id: 0, thumbnail: "/images/placeholder.png" }];

            const productForCard = {
              id: rp.id,
              title: rp.title,
              price: rp.price,
              discount: (rp as any).discount ?? 0,
              gallery,
              colors: rp.colors ?? [],
              sizes: rp.sizes ?? [],
              rating: (rp as any).rating ?? 5,
            };

            return (
              <div key={rp.id} className={styles.relatedItem}>
                <ProductCard
                  product={productForCard}
                  onOpenPopup={(p) => setSelectedProduct(p as Product)}
                  variant="default"
                />
              </div>
            );
          })}
        </div>
      </div>

      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;

// -------------------- SERVER SIDE --------------------
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  // helper: chuẩn hóa gallery để tránh undefined thumbnail
  const normalizeGalleryArray = (arr: any[] | undefined) => {
    if (!Array.isArray(arr) || arr.length === 0)
      return [{ id: 0, thumbnail: "/images/placeholder.png" }];
    return arr.map((g: any, idx: number) => {
      const thumb =
        g?.thumbnail ??
        g?.url ??
        g?.path ??
        g?.src ??
        "/images/placeholder.png";
      return { id: g.id ?? idx, thumbnail: thumb };
    });
  };

  try {
    const productRaw = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { gallery: true },
    });
    if (!productRaw) return { notFound: true };

    const product = {
      ...productRaw,
      created_at: productRaw.created_at.toISOString(),
      updated_at: productRaw.updated_at.toISOString(),
      colors: productRaw.colors || [],
      sizes: productRaw.sizes || [],
      gallery: normalizeGalleryArray(productRaw.gallery),
    };

    const relatedRaw = await prisma.product.findMany({
      where: {
        category_id: productRaw.category_id,
        id: { not: productRaw.id },
      },
      take: 4,
      include: { gallery: true },
    });

    const relatedProducts = relatedRaw.map((item) => ({
      ...item,
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
      gallery: normalizeGalleryArray(item.gallery),
    }));

    const reviewsRaw = await prisma.review.findMany({
      where: { product_id: productRaw.id },
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const reviews = reviewsRaw.map((r) => ({
      id: r.id,
      author: r.user ? `${r.user.firstName} ${r.user.lastName}` : "Anonymous",
      rating: r.rating,
      comment: r.comment || "",
      date: r.created_at.toISOString(),
    }));

    return {
      props: { product, relatedProducts, reviews },
    };
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    return {
      props: { product: {} as any, relatedProducts: [], reviews: [] },
    };
  }
};
