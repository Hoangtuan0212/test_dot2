import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  // Lấy session
  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Tìm user trong DB
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Xử lý method
  switch (req.method) {
    case "GET":
      // Lấy tất cả địa chỉ
      try {
        const addresses = await prisma.address.findMany({
          where: { userId: currentUser.id },
        });
        return res.status(200).json(addresses);
      } catch (error) {
        console.error("GET /api/address error:", error);
        return res.status(500).json({ message: "Lỗi khi lấy địa chỉ" });
      }

    case "POST":
      // Tạo địa chỉ mới
      try {
        const {
          firstName,
          lastName,
          company,
          phone,
          street,
          street2,
          city,
          state,
          country,
          zipCode,
          isDefault,
        } = req.body;

        // Kiểm tra trường bắt buộc
        if (!firstName || !lastName || !phone || !street || !city || !country) {
          return res.status(400).json({ message: "Thiếu trường bắt buộc" });
        }

        // Nếu đặt địa chỉ mặc định => reset tất cả địa chỉ khác
        if (isDefault) {
          await prisma.address.updateMany({
            where: { userId: currentUser.id },
            data: { isDefault: false },
          });
        }

        const newAddress = await prisma.address.create({
          data: {
            userId: currentUser.id,
            firstName,
            lastName,
            company,
            phone,
            street,
            street2,
            city,
            state,
            country,
            zipCode,
            isDefault,
          },
        });

        return res.status(201).json(newAddress);
      } catch (error) {
        console.error("POST /api/address error:", error);
        return res
          .status(500)
          .json({ message: "Lỗi khi thêm địa chỉ", error: error.message });
      }

    default:
      // Method không hỗ trợ
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ message: `Method ${req.method} Not Allowed` });
  }
}
