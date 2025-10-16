import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../../styles/auth.module.css";

export default function Register({ translations, language }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const userData = {
      lastName,
      firstName,
      gender,
      email: email.trim().toLowerCase(),
      password,
      ...(birthDate && { birthDate }),
    };

    try {
      const response = await axios.post("/api/auth/register", userData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        setSuccessMessage("🎉 Đăng ký thành công!");
        // Reset form
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setGender("");
        setBirthDate("");
        // Redirect to homepage
        router.push("/");
      } else {
        setErrorMessage(response.data.message || "⚠️ Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error.response?.data);
      setErrorMessage(error.response?.data?.message || "⚠️ Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.authForm} onSubmit={handleSubmit}>
      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
      {successMessage && <p className={styles.successText}>{successMessage}</p>}

      <div className={styles.formGroup}>
        <label htmlFor="firstName">
          {translations[language].firstNameLabel}
        </label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lastName">{translations[language].lastNameLabel}</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="gender">{translations[language].genderLabel}</label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">{translations[language].selectGender}</option>
          <option value="MALE">{translations[language].male}</option>
          <option value="FEMALE">{translations[language].female}</option>
          <option value="OTHER">{translations[language].other}</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="birthDate">
          {translations[language].birthDateLabel}
        </label>
        <input
          type="date"
          id="birthDate"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">{translations[language].emailLabel}</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">{translations[language].passwordLabel}</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "⏳ Đang xử lý..." : translations[language].signupButton}
      </button>
    </form>
  );
}
