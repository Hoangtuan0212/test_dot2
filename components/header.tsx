import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import AuthPopup from "../components/auth/AuthPopup";
import UserMenu from "../components/UserMenu";
import SearchBar from "../components/SearchBar";
import CartPopup from "../components/CartPopup";
import { useCart } from "../context/CartContext";
import styles from "../styles/Home.module.css";

// 🟩 Định nghĩa kiểu ngôn ngữ và kiểu dữ liệu cho translations
type Language = "Vietnam" | "English";

interface Translation {
  home: string;
  about: string;
  products: string;
}

// 🟩 Khai báo translations với kiểu rõ ràng
const translations: Record<Language, Translation> = {
  Vietnam: {
    home: "Trang Chủ",
    about: "Giới Thiệu",
    products: "Sản Phẩm",
  },
  English: {
    home: "Home",
    about: "About",
    products: "Products",
  },
};

interface CartIconProps {
  onClick?: () => void;
}

// ✅ CartIcon hiển thị ảnh giỏ hàng + số lượng
const CartIcon: React.FC<CartIconProps> = ({ onClick }) => {
  const { cart } = useCart();
  const totalQuantity = cart?.totalQuantity ?? 0;

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer select-none"
      style={{ display: "inline-block" }}
    >
      <img
        src="/images/icon/carticon.png"
        alt="Cart"
        width={28}
        height={28}
        className="w-7 h-7 object-contain"
      />
      {totalQuantity > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 min-w-[18px] text-center">
          {totalQuantity}
        </span>
      )}
    </div>
  );
};

export default function Header() {
  const { data: session } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("Vietnam");
  const [shrink, setShrink] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const authPopupRef = useRef<HTMLDivElement | null>(null);
  const cartPopupRef = useRef<HTMLDivElement | null>(null);

  // ✅ Thu nhỏ header khi scroll
  useEffect(() => {
    const handleScroll = () => setShrink(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Đóng popup auth khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        authPopupRef.current &&
        !authPopupRef.current.contains(event.target as Node)
      ) {
        setIsAuthOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Đóng popup giỏ hàng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartPopupRef.current &&
        !cartPopupRef.current.contains(event.target as Node)
      ) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`${styles.header} ${shrink ? styles.shrink : ""}`}>
      <div className={styles.topRow}>
        {/* 🟩 Logo */}
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image
              src="/images/icon/logo345.png"
              alt="O2IN Logo"
              width={167}
              height={50}
            />
          </Link>
        </div>

        {/* 🟩 Thanh công cụ trên cùng */}
        <div className={styles.topBar}>
          <UserMenu
            language={language}
            translations={translations}
            setShowAuthPopup={setIsAuthOpen}
          />

          <SearchBar />

          {/* 🛒 Icon giỏ hàng */}
          <div className="relative">
            <CartIcon onClick={() => setIsCartOpen(true)} />
          </div>

          {/* 🟩 Chọn ngôn ngữ */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className={styles.languageSelect}
          >
            <option value="Vietnam">Vietnam</option>
            <option value="English">English</option>
          </select>
        </div>
      </div>

      {/* 🟩 Navbar */}
      <nav className={styles.navbar}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link href="/" className={styles.navLink}>
              {translations[language].home}
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/about" className={styles.navLink}>
              {translations[language].about}
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/products" className={styles.navLink}>
              {translations[language].products}
            </Link>
          </li>
        </ul>
      </nav>

      {/* 🟩 Auth Popup */}
      {isAuthOpen && (
        <div ref={authPopupRef}>
          <AuthPopup
            show={isAuthOpen}
            setShow={setIsAuthOpen}
            language={language}
            translations={translations}
          />
        </div>
      )}

      {/* 🟩 Cart Popup */}
      {isCartOpen && (
        <div ref={cartPopupRef}>
          <CartPopup onClose={() => setIsCartOpen(false)} />
        </div>
      )}
    </header>
  );
}
