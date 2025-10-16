import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import styles from "../styles/SearchBar.module.css";

// Kiểu dữ liệu sản phẩm
interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Gọi API khi có từ khóa tìm kiếm
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setLoading(true);
      setError("");
      axios
        .get(`/api/products/search?query=${searchTerm}`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setProducts(res.data);
          } else {
            setProducts([]);
            setError("Dữ liệu trả về không hợp lệ.");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tìm kiếm sản phẩm:", err);
          setError("Không thể tải dữ liệu sản phẩm.");
        })
        .finally(() => setLoading(false));
    } else {
      setProducts([]);
    }
  }, [searchTerm]);

  // Đóng search box khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.searchWrapper}>
      <div
        className={styles.searchIcon}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Image
          src="/images/icon/searchicon.png"
          alt="Search"
          width={25}
          height={25}
        />
      </div>

      {isOpen && (
        <div className={styles.searchDropdown} ref={searchRef}>
          <div className={styles.searchHeader}>
            <span className={styles.searchTitle}>TÌM KIẾM</span>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
          </div>

          <div className={styles.searchBody}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />

            {loading && <div className={styles.loading}>Đang tìm kiếm...</div>}
            {error && <div className={styles.error}>{error}</div>}

            {searchTerm && !loading && !error && (
              <div className={styles.resultList}>
                {products.length === 0 ? (
                  <div className={styles.noResult}>Không tìm thấy sản phẩm</div>
                ) : (
                  products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className={styles.resultItem}
                    >
                      <div className={styles.imageWrapper}>
                        <Image
                          src={product.image || "/default.png"}
                          alt={product.name}
                          width={50}
                          height={50}
                        />
                      </div>
                      <div className={styles.infoWrapper}>
                        <div className={styles.productName}>{product.name}</div>
                        {product.discountPrice ? (
                          <div className={styles.priceGroup}>
                            <span className={styles.oldPrice}>
                              {product.price.toLocaleString("vi-VN")} VNĐ
                            </span>
                            <span className={styles.discountPrice}>
                              {product.discountPrice.toLocaleString("vi-VN")}{" "}
                              VNĐ
                            </span>
                          </div>
                        ) : (
                          <div className={styles.price}>
                            {product.price.toLocaleString("vi-VN")} VNĐ
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
