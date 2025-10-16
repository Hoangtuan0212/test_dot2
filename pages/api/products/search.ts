import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không được hỗ trợ" });
  }

  const { query } = req.query;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res
      .status(400)
      .json({ message: "Thiếu hoặc từ khóa tìm kiếm không hợp lệ" });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query.trim(), // Sửa 'name' thành 'title'
        },
      },
      select: {
        id: true,
        title: true, // Sửa 'name' thành 'title'
        price: true,
        discount: true, // Sửa 'discountPrice' thành 'discount'
        thumbnail: true, // Sửa 'image' thành 'thumbnail'
      },
      take: 10,
    });

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}
