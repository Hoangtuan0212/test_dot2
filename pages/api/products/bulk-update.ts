import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // Kết nối Prisma

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { products } = req.body; // Nhận danh sách sản phẩm cần cập nhật

    // Kiểm tra đầu vào
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid products data" });
    }

    // Danh sách lỗi nếu có sản phẩm không thể cập nhật
    const errors: { id: number; error: string }[] = [];

    // Cập nhật sản phẩm
    const updatePromises = products.map(async (product) => {
      if (
        !product.id ||
        typeof product.name !== "string" ||
        typeof product.price !== "number" ||
        typeof product.description !== "string" ||
        typeof product.imageUrl !== "string"
      ) {
        errors.push({
          id: product.id || 0,
          error: "Invalid product data structure",
        });
        return;
      }

      try {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            title: product.name, // Nếu trong Prisma schema tên là `title` thay vì `name`
            price: product.price,
            description: product.description,
            thumbnail: product.imageUrl, // Nếu hình ảnh sản phẩm lưu trong trường `thumbnail`
          },
        });
      } catch (err: any) {
        errors.push({
          id: product.id,
          error: err.message || "Unknown error occurred",
        });
      }
    });

    // Đợi tất cả các cập nhật hoàn thành
    await Promise.all(updatePromises);

    // Xử lý phản hồi
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Some products could not be updated",
        errors,
      });
    }

    return res.status(200).json({ message: "Cập nhật sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
}
