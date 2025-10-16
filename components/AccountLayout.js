// components/AccountLayout.js
import Link from "next/link";
import styles from "../styles/AccountLayout.module.css";

export default function AccountLayout({ children }) {
  return (
    <div className={styles.accountContainer}>
      {/* Cột bên trái: menu */}
      <div className={styles.menu}>
        <h2>TÀI KHOẢN</h2>
        <ul>
          <li>
            <Link href="/account">Thông tin tài khoản</Link>
          </li>
          <li>
            <Link href="/account/addresses">Danh sách địa chỉ</Link>
          </li>
          <li>
            <Link href="/api/auth/signout">Đăng xuất</Link>
            {/* Hoặc button onClick={() => signOut()} nếu bạn muốn */}
          </li>
        </ul>
      </div>

      {/* Cột bên phải: nội dung */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
