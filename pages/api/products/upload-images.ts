import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
// Import Prisma

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { productId, thumbnail } = req.body;

    // Kiểm tra đầu vào
    if (!productId || !Array.isArray(thumbnail) || thumbnail.length === 0) {
      return res.status(400).json({
        message: "Thiếu thông tin sản phẩm hoặc danh sách ảnh không hợp lệ",
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    let product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      // Nếu sản phẩm chưa tồn tại, tạo mới sản phẩm
      product = await prisma.product.create({
        data: {
          id: productId,
          title: `Sản phẩm ${productId}`, // Có thể tuỳ chỉnh tên
          description: "Mô tả sản phẩm tự động tạo",
          thumbnail: thumbnail[0], // Lấy ảnh đầu tiên làm ảnh đại diện
        },
      });

      console.log(`🆕 Tạo sản phẩm mới: ${productId}`);
    } else {
      // Nếu sản phẩm đã tồn tại, cập nhật ảnh đại diện
      await prisma.product.update({
        where: { id: productId },
        data: {
          thumbnail: thumbnail[0], // Lấy ảnh đầu tiên làm ảnh đại diện
        },
      });

      console.log(`✅ Cập nhật ảnh đại diện cho sản phẩm ${productId}`);
    }

    // Cập nhật hoặc thêm ảnh vào bảng Gallery
    for (const image of thumbnail) {
      await prisma.gallery.create({
        data: {
          product_id: productId,
          thumbnail: image,
        },
      });
    }

    return res.status(200).json({
      message: "Cập nhật ảnh thành công!",
      product,
    });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
}
