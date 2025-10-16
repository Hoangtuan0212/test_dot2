import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { productId, userId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ error: "Thiếu productId hoặc rating" });
    }

    try {
      const review = await prisma.review.create({
        data: {
          product_id: Number(productId),
          user_id: userId ? Number(userId) : null,
          rating: Number(rating),
          comment: comment || "",
        },
      });
      return res.status(201).json(review);
    } catch (error) {
      console.error("Lỗi tạo review:", error);
      return res.status(500).json({ error: "Lỗi máy chủ khi tạo review" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
