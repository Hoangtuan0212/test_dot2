import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Lấy 4 sản phẩm mới nhất dựa theo created_at (bạn có thể điều chỉnh logic nếu muốn lấy random)
    const suggestions = await prisma.product.findMany({
      take: 4,
      orderBy: { created_at: "desc" },
    });
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error("Lỗi /api/products/suggestions:", error);
    return res.status(500).json({ message: "Lỗi server không xác định" });
  }
}
