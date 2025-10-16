import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "❌ Method Not Allowed" });
  }

  try {
    const { email, phone, address, company } = req.body;

    console.log("📩 Received update request:", {
      email,
      phone,
      address,
      company,
    });

    // ✅ Kiểm tra email hợp lệ
    if (!email || typeof email !== "string") {
      console.log("⚠️ Missing or invalid email");
      return res.status(400).json({ message: "⚠️ Email không hợp lệ!" });
    }

    // ✅ Tìm user theo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("⚠️ User not found");
      return res.status(404).json({ message: "⚠️ Người dùng không tồn tại!" });
    }

    // ✅ Cập nhật thông tin mới
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        phone: phone || user.phone,
        address: address || user.address,
        company: company || user.company,
      },
    });

    console.log("✅ User profile updated:", updatedUser);

    return res.status(200).json({
      message: "🎉 Cập nhật thông tin thành công!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 Lỗi server:", error);
    return res.status(500).json({ message: "⚠️ Lỗi server, thử lại sau!" });
  }
}
