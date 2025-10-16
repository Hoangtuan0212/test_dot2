import { useState } from "react";
import { useRouter } from "next/router";
import { handleLogin } from "../utils/auth";
import styles from "../styles/auth.module.css";

const translations = {
  Vietnam: {
    email: "Email",
    password: "Mật khẩu",
    loginButton: "Đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    newCustomer: "Khách hàng mới?",
    createAccount: "Tạo tài khoản",
  },
  English: {
    email: "Email",
    password: "Password",
    loginButton: "Login",
    forgotPassword: "Forgot password?",
    newCustomer: "New customer?",
    createAccount: "Create an account",
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [language, setLanguage] = useState("Vietnam");
  const router = useRouter();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setErrorMessage("Email không hợp lệ!");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    await handleLogin(email, password, setErrorMessage, setLoading, router);
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
        <input
          type="email"
          placeholder={translations[language]?.email || "Email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={translations[language]?.password || "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className={styles.authButton}
          disabled={loading}
          aria-label="Login Button"
        >
          {loading
            ? "Đang đăng nhập..."
            : translations[language]?.loginButton || "Login"}
        </button>
      </form>
      <p
        className={styles.forgotPassword}
        onClick={() => router.push("/forgot-password")}
      >
        {translations[language]?.forgotPassword || "Forgot password?"}
      </p>
      <p>
        {translations[language]?.newCustomer || "New customer?"}{" "}
        <span
          onClick={() => router.push("/register")}
          className={styles.signupLink}
        >
          {translations[language]?.createAccount || "Create an account"}
        </span>
      </p>
    </div>
  );
}
