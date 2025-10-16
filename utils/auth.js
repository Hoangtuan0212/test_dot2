import { signIn } from "next-auth/react";

export const handleLogin = async (
  email,
  password,
  setErrorMessage,
  setLoading,
  router
) => {
  setErrorMessage("");
  setLoading(true);

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setErrorMessage(
        result.error || "Đăng nhập thất bại. Kiểm tra lại thông tin!"
      );
    } else {
      router.push("/"); // Redirect to homepage after successful login
    }
  } catch (error) {
    setErrorMessage("Lỗi kết nối. Vui lòng thử lại!");
    console.error("Lỗi đăng nhập:", error);
  } finally {
    setLoading(false);
  }
};
