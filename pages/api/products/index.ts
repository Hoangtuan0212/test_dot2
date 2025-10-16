import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // Kiểm tra đường dẫn Prisma

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Xử lý phương thức GET
  if (req.method === "GET") {
    try {
      const {
        category,
        minPrice,
        maxPrice,
        color, // Lấy từ query
        size, // Lấy từ query
        sort,
        page = "1",
        limit = "12",
      } = req.query;

      // Chuyển đổi query sang kiểu số
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 12;
      const minPriceNum = minPrice
        ? parseInt(minPrice as string, 10)
        : undefined;
      const maxPriceNum = maxPrice
        ? parseInt(maxPrice as string, 10)
        : undefined;

      // Xác định bộ lọc theo danh mục (tùy theo ID của danh mục trong DB)
      let categoryFilter;
      if (category === "ao") {
        categoryFilter = 1; // ID danh mục 'Áo'
      } else if (category === "quan") {
        categoryFilter = 2; // ID danh mục 'Quần'
      }

      // Xây dựng điều kiện lọc sản phẩm
      const filters: any = {};
      if (categoryFilter) filters.category_id = categoryFilter;
      if (minPriceNum) {
        filters.price = { gte: minPriceNum };
      }
      if (maxPriceNum) {
        filters.price = {
          ...(filters.price || {}),
          lte: maxPriceNum,
        };
      }

      // Nếu cột colors, sizes là JSON (mảng), dùng contains để so sánh chuỗi
      if (color) {
        filters.colors = { contains: `"${color}"` };
      }
      if (size) {
        filters.sizes = { contains: `"${size}"` };
      }

      // Lấy tổng số sản phẩm phù hợp với điều kiện lọc
      const totalCount = await prisma.product.count({ where: filters });
      const totalPages = Math.ceil(totalCount / limitNum);

      // Xác định thứ tự sắp xếp
      const orderBy =
        sort === "priceAsc"
          ? { price: "asc" }
          : sort === "priceDesc"
          ? { price: "desc" }
          : { created_at: "desc" }; // Mặc định sắp xếp theo sản phẩm mới nhất

      // Truy vấn danh sách sản phẩm theo phân trang với các điều kiện lọc
      const products = await prisma.product.findMany({
        where: filters,
        orderBy,
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
        select: {
          id: true,
          title: true,
          price: true,
          discount: true,
          thumbnail: true,
          // colors, sizes đã lưu dưới dạng JSON, Prisma tự parse thành mảng
          colors: true,
          sizes: true,
          gallery: {
            select: { thumbnail: true },
          },
        },
      });

      // Trả về dữ liệu sản phẩm cùng thông tin phân trang
      return res.status(200).json({
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi API sản phẩm:", error);
      return res
        .status(500)
        .json({ message: "Lỗi server, kiểm tra console backend!" });
    }
  }

  // Xử lý phương thức POST để chèn sản phẩm
  if (req.method === "POST") {
    try {
      const {
        title,
        price,
        discount,
        thumbnail,
        description,
        colors, // mong đợi là mảng JSON (hoặc chuỗi JSON)
        sizes, // mong đợi là mảng JSON (hoặc chuỗi JSON)
      } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!title || !price) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
      }

      // Chèn sản phẩm vào cơ sở dữ liệu
      const newProduct = await prisma.product.create({
        data: {
          title,
          price,
          discount,
          thumbnail,
          description,
          colors, // nếu truyền mảng, Prisma sẽ tự serialize thành JSON
          sizes,
        },
      });

      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("❌ Lỗi khi chèn sản phẩm:", error);
      return res
        .status(500)
        .json({ message: "Lỗi server, kiểm tra console backend!" });
    }
  }

  // Nếu phương thức không được hỗ trợ
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
