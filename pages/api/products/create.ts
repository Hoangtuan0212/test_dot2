// /pages/api/products/create.ts
// Tạo sản phẩm mới kèm nhiều ảnh gallery
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { title, price, discount, thumbnailUrl, galleryUrls } = req.body;

      // Tạo sản phẩm trước
      const newProduct = await prisma.product.create({
        data: {
          title,
          price,
          discount,
          thumbnail: thumbnailUrl,
          // ...
        },
      });

      // Sau đó, tạo nhiều dòng trong Gallery
      if (Array.isArray(galleryUrls) && galleryUrls.length > 0) {
        for (const url of galleryUrls) {
          await prisma.gallery.create({
            data: {
              product_id: newProduct.id,
              thumbnail: url,
            },
          });
        }
      }

      return res.status(200).json({ newProduct });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Lỗi khi tạo sản phẩm + gallery" });
    }
  } else {
    return res.status(405).end();
  }
}
