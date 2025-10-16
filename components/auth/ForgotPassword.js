import { useState } from "react";
import axios from "axios";
import styles from "../../styles/auth.module.css";

export default function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(
        "/api/auth/forgot-password",
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        setMessage("✅ Email reset mật khẩu đã được gửi!");
      }
    } catch (error) {
      console.error("Lỗi reset mật khẩu:", error.response?.data);
      setMessage(error.response?.data?.message || "⚠️ Lỗi reset mật khẩu!");
    }
  };

  return (
    <form className={styles.authForm} onSubmit={handleSubmit}>
      {message && <p className={styles.message}>{message}</p>}
      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" className={styles.submitButton}>
        Reset Password
      </button>
      <button type="button" className={styles.backToLogin} onClick={onClose}>
        Quay lại đăng nhập
      </button>
    </form>
  );
}
