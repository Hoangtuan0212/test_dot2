import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "🔴 Method Not Allowed" });
  }

  try {
    let { lastName, firstName, gender, birthDate, email, password } = req.body;

    console.log("📩 Dữ liệu nhận được:", {
      lastName,
      firstName,
      gender,
      birthDate,
      email,
      password,
    });

    if (
      !lastName ||
      !firstName ||
      !email ||
      !password ||
      !gender ||
      !birthDate
    ) {
      return res
        .status(400)
        .json({ message: "⚠️ Vui lòng nhập đầy đủ thông tin!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("⚠️ Email không hợp lệ:", email);
      return res.status(400).json({ message: "⚠️ Email không hợp lệ!" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "⚠️ Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số!",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("⚠️ Email đã tồn tại:", email);
      return res.status(400).json({ message: "⚠️ Email này đã được sử dụng!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Mật khẩu đã được mã hóa!");

    gender = gender.trim().toUpperCase();
    const validGenders = ["MALE", "FEMALE", "OTHER"];
    if (!validGenders.includes(gender)) {
      console.log("⚠️ Giới tính không hợp lệ:", gender);
      return res.status(400).json({ message: "⚠️ Giới tính không hợp lệ!" });
    }

    let parsedBirthDate = new Date(birthDate);
    if (isNaN(parsedBirthDate.getTime())) {
      console.error("⚠️ Ngày sinh không hợp lệ:", birthDate);
      return res.status(400).json({ message: "⚠️ Ngày sinh không hợp lệ!" });
    }

    const newUser = await prisma.user.create({
      data: {
        lastName,
        firstName,
        email,
        password: hashedPassword,
        gender,
        birthDate: parsedBirthDate,
      },
    });

    console.log("✅ Người dùng đã đăng ký thành công:", newUser);

    return res.status(201).json({
      message: "🎉 Đăng ký thành công!",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        gender: newUser.gender,
        birthDate: newUser.birthDate,
      },
    });
  } catch (error) {
    console.error("🔥 Lỗi server:", error);

    if (error.code === "P2002") {
      return res.status(400).json({ message: "⚠️ Email đã tồn tại!" });
    }
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ message: "⚠️ Dữ liệu không hợp lệ (vi phạm khóa ngoại)!" });
    }

    return res
      .status(500)
      .json({
        message: "❌ Có lỗi xảy ra, vui lòng thử lại sau!",
        error: error.message,
      });
  }
}
