import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id, title, price, description, thumbnail } = req.body;

    // Kiểm tra đầu vào hợp lệ
    if (!id || typeof id !== "number") {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    if (title && typeof title !== "string") {
      return res.status(400).json({ message: "Tên sản phẩm không hợp lệ" });
    }

    if (price && typeof price !== "number") {
      return res.status(400).json({ message: "Giá sản phẩm không hợp lệ" });
    }

    if (description && typeof description !== "string") {
      return res.status(400).json({ message: "Mô tả sản phẩm không hợp lệ" });
    }

    if (thumbnail && typeof thumbnail !== "string") {
      return res.status(400).json({ message: "Ảnh sản phẩm không hợp lệ" });
    }

    // Cập nhật sản phẩm trong database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        price,
        description,
        thumbnail,
      },
    });

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
}
