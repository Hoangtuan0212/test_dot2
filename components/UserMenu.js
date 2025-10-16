import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const UserMenu = ({ language, translations, setShowAuthPopup }) => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserIconClick = () => {
    if (session) {
      setShowDropdown((prev) => !prev);
    } else {
      setShowAuthPopup(true); // Mở popup đăng nhập nếu chưa đăng nhập
    }
  };

  return (
    <div className={styles.userContainer} ref={dropdownRef}>
      <Image
        src="/images/icon/usericon.png"
        alt="User Icon"
        width={25}
        height={25}
        className={styles.userIcon}
        onClick={handleUserIconClick}
      />

      {session && showDropdown && (
        <div
          className={`${styles.dropdownMenu} ${
            showDropdown ? styles.active : ""
          }`}
        >
          {/* Tiêu đề dropdown */}
          <div className={styles.dropdownHeader}>THÔNG TIN TÀI KHOẢN</div>

          {/* Hiển thị tên người dùng */}
          <div className={styles.userName}>
            <strong>
              {session.user?.name ||
                `${session.user?.firstName || ""} ${
                  session.user?.lastName || ""
                }`}
            </strong>
          </div>

          {/* Danh sách điều hướng */}
          <ul className={styles.dropdownList}>
            <li>
              <Link href="/account">
                <span className={styles.bullet}>•</span>{" "}
                {translations[language]?.account || "Tài khoản của bạn"}
              </Link>
            </li>
            <li>
              <Link href="/account/addresses">
                <span className={styles.bullet}>•</span>{" "}
                {translations[language]?.addresses || "Danh sách địa chỉ"}
              </Link>
            </li>
            <li>
              <button onClick={() => signOut()}>
                <span className={styles.bullet}>•</span>{" "}
                {translations[language]?.logout || "Đăng xuất"}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
