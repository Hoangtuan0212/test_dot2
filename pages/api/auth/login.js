import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "❌ Method Not Allowed" });
  }

  try {
    let { email, password } = req.body;

    // ✅ Kiểm tra email và mật khẩu không rỗng
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "⚠️ Vui lòng nhập email và mật khẩu!" });
    }

    // ✅ Chuẩn hóa email (trim và lower-case) để khớp với quá trình đăng ký
    email = email.trim().toLowerCase();
    console.log("🔍 Email sau khi chuẩn hóa:", email);

    // ✅ Kiểm tra email có tồn tại không
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("⚠️ Không tìm thấy user với email:", email);
      return res
        .status(401)
        .json({ message: "⚠️ Email hoặc mật khẩu không chính xác!" });
    }

    // ✅ Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔍 Kết quả so sánh mật khẩu:", isPasswordValid);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "⚠️ Email hoặc mật khẩu không chính xác!" });
    }

    // ✅ Kiểm tra JWT_SECRET có tồn tại không
    if (!process.env.JWT_SECRET) {
      console.error("🚨 Lỗi: Thiếu biến môi trường JWT_SECRET!");
      return res
        .status(500)
        .json({ message: "⚠️ Lỗi máy chủ, vui lòng thử lại sau!" });
    }

    // ✅ Tạo token đăng nhập
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Không trả về password để bảo mật
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      birthDate: user.birthDate,
      createdAt: user.createdAt,
    };

    console.log("✅ Đăng nhập thành công, token:", token);
    return res
      .status(200)
      .json({ message: "✅ Đăng nhập thành công!", token, user: userData });
  } catch (error) {
    console.error("🔥 Lỗi server:", error);
    return res.status(500).json({ message: "⚠️ Lỗi server, thử lại sau!" });
  }
}
