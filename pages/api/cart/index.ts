// pages/api/cart/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";

/* global prisma pattern */
declare global {
  var prisma: PrismaClient | undefined;
}
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Lấy session
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    const userId = parseInt(String(session.user?.id ?? ""), 10);
    if (isNaN(userId) || !userId) {
      return res.status(401).json({ message: "Không xác định được userId" });
    }

    if (req.method === "GET") {
      // Lấy cart (include cartitem và products + gallery)
      let cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          cartitem: {
            include: {
              products: {
                include: {
                  gallery: true,
                },
              },
            },
          },
        },
      });

      // Nếu chưa có cart, tạo mới (chú ý nếu schema yêu cầu updatedAt, đảm bảo schema có @updatedAt)
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            cartitem: {
              include: {
                products: {
                  include: { gallery: true },
                },
              },
            },
          },
        });
      }

      // Map cartitem -> cartItems và rename products -> product để frontend không phải đổi
      const cartItems = (cart?.cartitem ?? []).map((ci: any) => ({
        id: ci.id,
        productId: ci.productId,
        quantity: ci.quantity,
        product: ci.products
          ? {
              id: ci.products.id,
              title: ci.products.title,
              price: ci.products.price,
              discount: ci.products.discount,
              thumbnail: ci.products.thumbnail,
              colors: ci.products.colors,
              sizes: ci.products.sizes,
              gallery: Array.isArray(ci.products.gallery)
                ? ci.products.gallery.map((g: any) => ({
                    thumbnail: g.thumbnail,
                  }))
                : [],
            }
          : null,
      }));

      const totalQuantity = cartItems.reduce(
        (acc: number, it: any) => acc + (it.quantity || 0),
        0
      );

      return res.status(200).json({ cartItems, totalQuantity });
    }

    // POST: thêm sản phẩm vào giỏ (giữ nguyên logic)
    if (req.method === "POST") {
      const { productId, quantity } = req.body;
      if (!productId || !quantity) {
        return res
          .status(400)
          .json({ message: "Thiếu productId hoặc quantity" });
      }

      const qty = Number(quantity);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({ message: "Số lượng không hợp lệ" });
      }

      let cart = await prisma.cart.findFirst({ where: { userId } });
      if (!cart) {
        // Nếu schema yêu cầu updatedAt không default, có thể sẽ lỗi ở đây — tốt nhất set @updatedAt trong schema.prisma
        cart = await prisma.cart.create({ data: { userId } });
      }

      const existingItem = await prisma.cartitem.findFirst({
        where: { cartId: cart.id, productId },
      });

      if (existingItem) {
        await prisma.cartitem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + qty },
        });
      } else {
        await prisma.cartitem.create({
          data: { cartId: cart.id, productId, quantity: qty },
        });
      }

      return res.status(200).json({ message: "Đã thêm vào giỏ hàng" });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  } catch (error: any) {
    console.error("Lỗi chung /api/cart:", error);
    return res.status(500).json({
      message: "Lỗi server không xác định",
      error: error?.message ?? error,
    });
  }
}
