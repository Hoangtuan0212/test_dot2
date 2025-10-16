import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";

/* ----------- GLOBAL PRISMA CLIENT ----------- */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/* ----------- API HANDLER ----------- */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // --- Lấy session ---
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    const userId = parseInt(String(session.user?.id ?? ""), 10);
    if (isNaN(userId) || !userId) {
      return res.status(401).json({ message: "Không xác định được userId" });
    }

    // ===================== GET CART =====================
    if (req.method === "GET") {
      let cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          cartItems: {
            include: {
              product: {
                include: {
                  gallery: true,
                },
              },
            },
          },
        },
      });

      // Nếu chưa có giỏ hàng → tạo mới
      if (!cart) {
        const newCart = await prisma.cart.create({
          data: { userId },
        });

        cart = await prisma.cart.findUnique({
          where: { id: newCart.id },
          include: {
            cartItems: {
              include: {
                product: {
                  include: { gallery: true },
                },
              },
            },
          },
        });
      }

      // Map dữ liệu cho frontend
      const cartItems = (cart?.cartItems ?? []).map((ci: any) => ({
        id: ci.id,
        productId: ci.productId,
        quantity: ci.quantity,
        product: ci.product
          ? {
              id: ci.product.id,
              title: ci.product.title,
              price: ci.product.price,
              discount: ci.product.discount,
              thumbnail: ci.product.thumbnail,
              colors: ci.product.colors,
              sizes: ci.product.sizes,
              gallery: Array.isArray(ci.product.gallery)
                ? ci.product.gallery.map((g: any) => ({
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

    // ===================== POST CART =====================
    if (req.method === "POST") {
      const { productId, quantity } = req.body;
      if (!productId || !quantity) {
        return res.status(400).json({ message: "Thiếu productId hoặc quantity" });
      }

      const qty = Number(quantity);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({ message: "Số lượng không hợp lệ" });
      }

      let cart = await prisma.cart.findFirst({ where: { userId } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + qty },
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity: qty },
        });
      }

      return res.status(200).json({ message: "Đã thêm vào giỏ hàng" });
    }

    // ===================== METHOD NOT ALLOWED =====================
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error: any) {
    console.error("Lỗi chung /api/cart:", error);
    return res.status(500).json({
      message: "Lỗi server không xác định",
      error: error?.message ?? error,
    });
  }
}
