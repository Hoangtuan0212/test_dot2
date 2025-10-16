import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const productId = Number(id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "ID không hợp lệ" });
      }

      // Lấy sản phẩm
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          gallery: true,
        },
      });
      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      // Lấy reviews kèm user
      const reviewsRaw = await prisma.review.findMany({
        where: { product_id: product.id },
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      const reviews = reviewsRaw.map((r) => ({
        id: r.id,
        author: r.user ? `${r.user.firstName} ${r.user.lastName}` : "Anonymous",
        rating: r.rating,
        comment: r.comment || "",
        date: r.created_at.toISOString(),
      }));

      return res.status(200).json({
        product,
        reviews,
      });
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      return res
        .status(500)
        .json({ error: "Lỗi máy chủ, vui lòng thử lại sau!" });
    }
  }

  // Nếu không phải GET
  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
