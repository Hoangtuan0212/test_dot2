import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/register.module.css";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    gender: "MALE", // Mặc định là Nam (đúng enum trong Prisma)
    birthDate: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? (checked ? value : prev[name]) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.lastName ||
      !formData.firstName ||
      !formData.gender ||
      !formData.birthDate ||
      !formData.email ||
      !formData.password
    ) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const formattedBirthDate = new Date(formData.birthDate).toISOString();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          birthDate: formattedBirthDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Đăng ký thành công!");
        router.push("/login");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>Đăng ký</h2>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            name="lastName"
            placeholder="Họ"
            value={formData.lastName}
            onChange={handleChange}
            className={styles.registerInput}
            required
          />
          <input
            type="text"
            name="firstName"
            placeholder="Tên"
            value={formData.firstName}
            onChange={handleChange}
            className={styles.registerInput}
            required
          />
        </div>

        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="gender"
              value="MALE"
              checked={formData.gender === "MALE"}
              onChange={handleChange}
              required
            />{" "}
            Nam
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="FEMALE"
              checked={formData.gender === "FEMALE"}
              onChange={handleChange}
              required
            />{" "}
            Nữ
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="OTHER"
              checked={formData.gender === "OTHER"}
              onChange={handleChange}
              required
            />{" "}
            Khác
          </label>
        </div>

        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className={styles.registerInput}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={styles.registerInput}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          className={styles.registerInput}
          required
        />

        <button type="submit" className={styles.registerButton}>
          Đăng ký
        </button>
      </form>

      <p className={styles.registerSwitchText}>
        Đã có tài khoản?
        <button
          className={styles.registerSwitchLink}
          onClick={() => router.push("/login")}
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}
