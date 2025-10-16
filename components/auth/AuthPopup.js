import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import LoginForm from "./LoginForm";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import styles from "../../styles/auth.module.css";

export default function AuthPopup({ show, setShow, language, translations }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const popupRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthPopup nhận giá trị show:", show);
    if (show && popupRef.current) {
      popupRef.current.focus();
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        console.log("Click outside -> đóng popup");
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  useEffect(() => {
    if (!show) return;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        console.log("Nhấn ESC -> đóng popup");
        setShow(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [show]);

  useEffect(() => {
    if (!show) return;

    const handleRouteChange = () => {
      console.log("Chuyển trang -> đóng popup");
      setShow(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [show, router]);

  if (!show) return null;

  return (
    <div className={styles.authPopupOverlay}>
      <div
        className={styles.authPopupBox}
        ref={popupRef}
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện onClick từ nền tối
      >
        <button
          className={styles.closeButton}
          onClick={() => {
            console.log("Bấm nút đóng -> đóng popup");
            setShow(false);
          }}
        >
          &times;
        </button>
        <h2>
          {isLogin
            ? translations[language].loginTitle
            : translations[language].signupTitle}
        </h2>
        {isForgotPassword ? (
          <ForgotPassword onClose={() => setIsForgotPassword(false)} />
        ) : isLogin ? (
          <LoginForm
            translations={translations}
            language={language}
            onForgotPassword={() => setIsForgotPassword(true)}
            onCreateAccount={() => setIsLogin(false)}
            autoFocus
          />
        ) : (
          <Register translations={translations} language={language} />
        )}
      </div>
    </div>
  );
}
