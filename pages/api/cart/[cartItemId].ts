// pages/api/cart/[cartItemId].ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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
    // --- Check session ---
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    // NextAuth trả id là string (theo cấu hình), convert sang number nếu cần
    const userId = Number(session.user?.id);
    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({ message: "Không xác định được userId" });
    }

    // --- Validate cartItemId from URL ---
    const rawId = req.query.cartItemId;
    const cartItemId = Array.isArray(rawId) ? Number(rawId[0]) : Number(rawId);
    if (!cartItemId || Number.isNaN(cartItemId)) {
      return res.status(400).json({ message: "cartItemId không hợp lệ" });
    }

    // --------- Handler các method ----------
    if (req.method === "GET") {
      // Lấy cartItem, sau đó kiểm tra quyền sở hữu
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
      });

      if (!cartItem) {
        return res.status(404).json({ message: "Không tìm thấy item trong giỏ hàng" });
      }

      // Kiểm tra quyền: nếu cartItem có cartId -> lấy cart để đối chiếu userId
      if ("cartId" in cartItem && cartItem.cartId) {
        const cart = await prisma.cart.findUnique({
          where: { id: cartItem.cartId },
        });
        if (!cart || (cart as any).userId !== userId) {
          return res.status(403).json({ message: "Bạn không có quyền truy cập item này" });
        }
      } else if ("userId" in cartItem) {
        // Nếu cartItem gắn trực tiếp userId
        if ((cartItem as any).userId !== userId) {
          return res.status(403).json({ message: "Bạn không có quyền truy cập item này" });
        }
      }

      return res.status(200).json({ data: cartItem });
    }

    if (req.method === "PUT") {
      // Thường dùng để update quantity hoặc thuộc tính khác
      const { quantity } = req.body ?? {};

      if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "quantity phải là số nguyên dương" });
      }

      // Xác thực quyền sở hữu tương tự GET
      const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
      if (!cartItem) {
        return res.status(404).json({ message: "Không tìm thấy item trong giỏ hàng" });
      }

      if ("cartId" in cartItem && cartItem.cartId) {
        const cart = await prisma.cart.findUnique({ where: { id: cartItem.cartId } });
        if (!cart || (cart as any).userId !== userId) {
          return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa item này" });
        }
      } else if ("userId" in cartItem) {
        if ((cartItem as any).userId !== userId) {
          return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa item này" });
        }
      }

      const updated = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });

      return res.status(200).json({ message: "Cập nhật thành công", data: updated });
    }

    if (req.method === "DELETE") {
      // Xác thực quyền sở hữu
      const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
      if (!cartItem) {
        return res.status(404).json({ message: "Không tìm thấy item trong giỏ hàng" });
      }

      if ("cartId" in cartItem && cartItem.cartId) {
        const cart = await prisma.cart.findUnique({ where: { id: cartItem.cartId } });
        if (!cart || (cart as any).userId !== userId) {
          return res.status(403).json({ message: "Bạn không có quyền xóa item này" });
        }
      } else if ("userId" in cartItem) {
        if ((cartItem as any).userId !== userId) {
          return res.status(403).json({ message: "Bạn không có quyền xóa item này" });
        }
      }

      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return res.status(200).json({ message: "Xóa item khỏi giỏ hàng thành công" });
    }

    // Nếu method khác
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} không được hỗ trợ` });
  } catch (error) {
    console.error("API /cart/[cartItemId] error:", error);
    return res.status(500).json({ message: "Lỗi server", error: (error as any)?.message ?? error });
  }
}


