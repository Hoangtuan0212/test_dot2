import { useState } from "react";
import { useRouter } from "next/router";
import AuthPopup from "./AuthPopup";
import LoginForm from "./LoginForm";

import ForgotPassword from "./ForgotPassword";
import styles from "../../styles/Home.module.css";

export default function Login({ translations, language }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  const handleSignupClick = () => {
    router.push("/register");
  };

  return (
    <div className={styles.authContainer}>
      {/* Thêm console.log để kiểm tra khi bấm nút */}
      <button
        onClick={() => {
          console.log("User clicked login button"); // Kiểm tra click
          setShowPopup(true);
        }}
        className={styles.authButton}
      >
        {translations[language].loginButton}
      </button>

      {/* Sửa props truyền vào AuthPopup */}
      {showPopup && (
        <AuthPopup
          show={showPopup}
          setShow={setShowPopup}
          language={language}
          translations={translations}
        />
      )}

      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}
