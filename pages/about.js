import Image from "next/image";
import styles from "../styles/about.module.css"; // Đường dẫn import chuẩn

export default function About() {
  return (
    <div className={styles.aboutContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>Chào mừng đến với O2IN</h1>
          <p>Thương hiệu thời trang bền vững và hiện đại</p>
        </div>
        {/* Sửa lỗi Next.js 13: dùng `fill` và `style={{ objectFit: "cover" }}` */}
        <Image
          src="/images/banner.webp"
          alt="Hero Background"
          fill
          style={{ objectFit: "cover" }}
          className={styles.heroImage}
        />
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <h2>Mission</h2>
        <p>
          Chúng tôi cam kết mang đến sản phẩm thời trang chất lượng cao từ vật
          liệu tái chế, bảo vệ môi trường.
        </p>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <h2>Our Team</h2>
        <p>
          Đội ngũ sáng tạo và đam mê của O2IN luôn nỗ lực không ngừng để mang
          lại giá trị cho cộng đồng và môi trường.
        </p>
      </section>
    </div>
  );
}
