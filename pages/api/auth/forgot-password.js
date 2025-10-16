import { prisma } from "../../../lib/prisma";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "❌ Method Not Allowed" });
  }

  const { email } = req.body;

  try {
    // ✅ Kiểm tra email có tồn tại không
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "⚠️ Email không tồn tại!" });
    }

    // ✅ Tạo token reset password (giả sử bạn có một hàm tạo token)
    const resetToken = "some-generated-token"; // Thay thế bằng hàm tạo token thực tế

    // ✅ Lưu token vào database (giả sử bạn có một bảng lưu token)
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000), // Token hết hạn sau 1 giờ
      },
    });

    // ✅ Gửi email reset password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset mật khẩu",
      text: `Bạn đã yêu cầu reset mật khẩu. Vui lòng click vào link sau để reset mật khẩu: ${process.env.BASE_URL}/reset-password?token=${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "✅ Email reset mật khẩu đã được gửi!" });
  } catch (error) {
    console.error("🔥 Lỗi server:", error);
    return res.status(500).json({ message: "⚠️ Lỗi server, thử lại sau!" });
  }
}
