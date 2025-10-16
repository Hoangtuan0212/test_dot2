import { getSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { useLanguage } from "../context/LanguageContext";

const products = [
  {
    id: 1,
    name: "Áo thun nam",
    price: "350.000 VNĐ",
    image: "/images/tshirt1.webp",
    colors: ["#000000", "#FFFFFF", "#C0C0C0", "#808080"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "Áo polo nam",
    price: "450.000 VNĐ",
    image: "/images/tshirt1.webp",
    colors: ["#1B1B1B", "#4A4A4A", "#D1BFA8", "#F5F5F5"],
    sizes: ["M", "L", "XL", "2XL"],
  },
];

export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: { session },
  };
}

export default function Home({ session }) {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>O2IN - Thời trang nam bền vững</title>
        <meta
          name="description"
          content="O2IN - Thời trang nam từ vỏ hàu và cà phê"
        />
      </Head>

      <div className="banner" style={{ width: "100%" }}>
        <Image
          src="/images/banner.webp"
          alt="Banner"
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Sản phẩm nổi bật */}
      <section className={styles.products}>
        <h2>{language === "vi" ? "Sản phẩm nổi bật" : "Featured Products"}</h2>
        <div className={styles.productList}>
          {products.map((product) => (
            <div
              key={product.id}
              className={styles.productCard}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link href={`/products/${product.id}`} legacyBehavior>
                <a>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={400}
                  />
                </a>
              </Link>
              <h3>{product.name}</h3>
              <p className={styles.price}>{product.price}</p>

              {/* Overlay khi hover */}
              {hoveredProduct === product.id && (
                <div className={styles.productOverlay}>
                  <p>
                    {language === "vi"
                      ? "Thêm nhanh vào giỏ hàng +"
                      : "Quick add to cart +"}
                  </p>
                  <div className={styles.sizeOptions}>
                    {product.sizes.map((size, index) => (
                      <button key={index} className={styles.sizeButton}>
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className={styles.colorOptions}>
                    {product.colors.map((color, index) => (
                      <span
                        key={index}
                        className={styles.colorDot}
                        style={{ backgroundColor: color }}
                      ></span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
