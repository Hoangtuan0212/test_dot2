import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid address ID" });
  }

  // Tìm user
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  switch (req.method) {
    case "PUT":
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

        // Kiểm tra địa chỉ có tồn tại không
        const existingAddress = await prisma.address.findUnique({
          where: { id: Number(id) },
        });
        if (!existingAddress) {
          return res.status(404).json({ message: "Address not found" });
        }

        // Nếu đặt mặc định => reset các address khác
        if (isDefault) {
          await prisma.address.updateMany({
            where: { userId: currentUser.id },
            data: { isDefault: false },
          });
        }

        const updated = await prisma.address.update({
          where: { id: Number(id) },
          data: {
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
        return res.status(200).json(updated);
      } catch (error) {
        console.error("PUT /api/address/[id] error:", error);
        return res.status(500).json({
          message: "Cập nhật địa chỉ thất bại",
          error: error.message,
        });
      }

    case "DELETE":
      try {
        const existingAddress = await prisma.address.findUnique({
          where: { id: Number(id) },
        });
        if (!existingAddress) {
          return res.status(404).json({ message: "Address not found" });
        }

        await prisma.address.delete({ where: { id: Number(id) } });
        return res.status(200).json({ message: "Xoá địa chỉ thành công" });
      } catch (error) {
        console.error("DELETE /api/address/[id] error:", error);
        return res.status(500).json({
          message: "Xoá địa chỉ thất bại",
          error: error.message,
        });
      }

    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      return res
        .status(405)
        .json({ message: `Method ${req.method} Not Allowed` });
  }
}
