import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";

// 👉 Khởi tạo Prisma Client an toàn cho cả Dev và Production
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("=== [cartItemId].ts ===", req.method, req.query);

    // 🧩 Kiểm tra session
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    const userId = Number(session.user?.id);
    if (!userId) {
      return res.status(400).json({ message: "Không xác định được userId" });
    }

    // 📦 Lấy ID từ query
    const { cartItemId } = req.query;
    const parsedId = Array.isArray(cartItemId)
      ? parseInt(cartItemId[0], 10)
      : parseInt(cartItemId || "", 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ message: "cartItemId không hợp lệ" });
    }

    // 🧾 Kiểm tra quyền sở hữu CartItem
    const cartItem = await prisma.cartitem.findUnique({
      where: { id: parsedId },
      include: {
        cart: {
          select: { userId: true },
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({ message: "Không có quyền thao tác giỏ hàng này" });
    }

    // 🛠 Xử lý PATCH (update quantity)
    if (req.method === "PATCH" || req.method === "PUT") {
      const qty = Number(req.body.quantity);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({ message: "Số lượng không hợp lệ" });
      }

      const updated = await prisma.cartitem.update({
        where: { id: parsedId },
        data: { quantity: qty },
      });

      return res.status(200).json({
        message: "Cập nhật số lượng thành công",
        cartItem: updated,
      });
    }

    // 🗑 Xử lý DELETE
    if (req.method === "DELETE") {
      await prisma.cartitem.delete({
        where: { id: parsedId },
      });

      return res.status(200).json({
        message: "Đã xoá sản phẩm khỏi giỏ hàng",
        deletedId: parsedId,
      });
    }

    // ❌ Method không hợp lệ
    res.setHeader("Allow", ["PATCH", "PUT", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} không được phép` });
  } catch (error: any) {
    console.error("🔥 Lỗi /api/cart/[cartItemId]:", error);
    return res.status(500).json({
      message: "Lỗi server không xác định",
      error: error.message || error,
    });
  }
}
