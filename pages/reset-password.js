import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/resetPassword.module.css";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Call API to reset password (implement the API endpoint)
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successful");
        router.push("/login");
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error resetting password");
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <h2 className={styles.resetPasswordTitle}>Reset Password</h2>
      <form onSubmit={handleSubmit} className={styles.resetPasswordForm}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.resetPasswordInput}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.resetPasswordInput}
          required
        />
        <button type="submit" className={styles.resetPasswordButton}>
          Reset Password
        </button>
      </form>
      {message && <p className={styles.resetPasswordMessage}>{message}</p>}
    </div>
  );
}
