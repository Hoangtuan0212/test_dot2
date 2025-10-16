import styles from "../styles/footer.module.css";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Kết nối mạng xã hội */}
        <div className={styles.socials}>
          <h4 className={styles.sectionTitle}>Kết nối với chúng tôi</h4>
          <div className={styles.icons}>
            <a href="#">
              <Image
                src="/icons/facebook.png"
                alt="Facebook"
                width={30}
                height={30}
              />
            </a>
            <a href="#">
              <Image
                src="/icons/twitter.png"
                alt="Twitter"
                width={30}
                height={30}
              />
            </a>
            <a href="#">
              <Image
                src="/icons/google.png"
                alt="Google"
                width={30}
                height={30}
              />
            </a>
            <a href="#">
              <Image
                src="/icons/youtube.png"
                alt="YouTube"
                width={30}
                height={30}
              />
            </a>
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div className={styles.info}>
          <h4 className={styles.sectionTitle}>Liên hệ</h4>
          <p>CÔNG TY TNHH O2IN</p>
          <p>📍 Linh Tây, số 47, đường Thạnh Mỹ Lợi, Thủ Đức</p>
          <p>📞 0937121573</p>
          <p>📧 02inbrand@gmail.com</p>
        </div>

        {/* Hỗ trợ khách hàng */}
        <div className={styles.support}>
          <h4 className={styles.sectionTitle}>Hỗ trợ</h4>
          <ul>
            <li>Chính sách bảo mật</li>
            <li>Chính sách giao hàng - thanh toán</li>
            <li>Chính sách đổi trả</li>
            <li>Cách chọn size</li>
            <li>Bảo quản sản phẩm</li>
            <li>Tìm cửa hàng</li>
            <li>Khách hàng thân thiết</li>
            <li>Điều khoản dịch vụ</li>
          </ul>
        </div>

        {/* Dịch vụ đặc biệt */}
        <div className={styles.services}>
          <h4 className={styles.sectionTitle}>Dịch vụ đặc biệt</h4>
          <ul>
            <li>Sửa hàng miễn phí</li>
            <li>Đặt may theo số đo</li>
          </ul>
        </div>
      </div>

      {/* Phương thức thanh toán và vận chuyển */}
      <div className={styles.paymentShipping}>
        <h4 className={styles.sectionTitle}>Phương thức thanh toán</h4>
        <div className={styles.paymentIcons}>
          <Image
            src="/icons/zalopay.png"
            alt="ZaloPay"
            width={50}
            height={30}
          />
          <Image
            src="/icons/fundiin.png"
            alt="Fundiin"
            width={50}
            height={30}
          />
          <Image src="/icons/vnpay.png" alt="VNPay" width={50} height={30} />
        </div>
        <h4 className={styles.sectionTitle}>Phương thức vận chuyển</h4>
        <div className={styles.shippingIcons}>
          <Image src="/icons/ghn.png" alt="GHN" width={50} height={30} />
          <Image
            src="/icons/viettel.png"
            alt="Viettel"
            width={50}
            height={30}
          />
          <Image
            src="/icons/grab.png"
            alt="GrabExpress"
            width={50}
            height={30}
          />
          <Image
            src="/icons/j&t.png"
            alt="J&T Express"
            width={50}
            height={30}
          />
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <p>
          Copyright © 2025 O2IN Official. <span>Powered by HOANGTUAN</span>
        </p>
      </div>
    </footer>
  );
}
