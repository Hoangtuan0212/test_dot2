import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// In ra các biến môi trường cần thiết để debug
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_S3_BUCKET:", process.env.AWS_S3_BUCKET);

import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import prisma from "../lib/prisma"; // Đảm bảo đường dẫn chính xác tới file prisma.ts

// Cấu hình biến môi trường
const BUCKET = process.env.AWS_S3_BUCKET || "manggg2025-images";
const REGION = process.env.AWS_REGION || "ap-southeast-1";

// Folder gốc trên S3 đã đổi sang "SAN-PHAM-MANG/"
const ROOT_PREFIX = "SAN-PHAM-MANG/";

// Map folder (ÁO, QUẦN) sang category_id – cần khớp với bảng category trong DB
const categoryMap: Record<string, number> = {
  ÁO: 1,
  QUẦN: 2,
};

// Khởi tạo S3 client với credentials từ biến môi trường
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

// Hàm tạo URL đầy đủ từ S3 key
function getS3Url(key: string): string {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * listSubfolders(prefix) - Liệt kê các folder con (CommonPrefixes) dưới một prefix
 * sử dụng Delimiter "/" để phân chia.
 */
async function listSubfolders(prefix: string): Promise<string[]> {
  const cmd = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
    Delimiter: "/",
  });
  const result: ListObjectsV2CommandOutput = await s3.send(cmd);
  const subfolders = result.CommonPrefixes || [];
  return subfolders.map((cp) => cp.Prefix!).filter((p): p is string => !!p);
}

async function importProducts() {
  try {
    console.log("Bắt đầu import sản phẩm từ S3...");

    // Bước 1: Lấy các folder con trong ROOT_PREFIX (ví dụ: "SAN-PHAM-MANG/ÁO/", "SAN-PHAM-MANG/QUẦN/")
    const mainFolders = await listSubfolders(ROOT_PREFIX);
    if (mainFolders.length === 0) {
      console.log("Không tìm thấy folder con trong:", ROOT_PREFIX);
      return;
    }

    for (const mainFolder of mainFolders) {
      // Lấy tên folder, ví dụ: "ÁO" hoặc "QUẦN"
      const folderName = path.basename(mainFolder.replace(/\/$/, ""));
      const category_id = categoryMap[folderName] || 0;
      if (!category_id) {
        console.log(`Bỏ qua folder '${folderName}' vì chưa map category.`);
        continue;
      }

      // Bước 2: Lấy các subfolder con (ví dụ: "A1/", "A2/", "A3/" nếu folder là "ÁO"; "Q1/", "Q2/", "Q3/" nếu folder là "QUẦN")
      const subFolders = await listSubfolders(mainFolder);
      if (subFolders.length === 0) {
        console.log(`Không có subfolder nào trong ${mainFolder}`);
        continue;
      }

      for (const productFolder of subFolders) {
        // Ví dụ: "SAN-PHAM-MANG/ÁO/A1/"
        const productName = path.basename(productFolder.replace(/\/$/, ""));

        // Lấy danh sách file trong subfolder
        const listCmd = new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: productFolder,
        });
        const listResult = await s3.send(listCmd);
        const contents = listResult.Contents || [];
        if (contents.length === 0) {
          console.log(`Folder rỗng: ${productFolder}`);
          continue;
        }

        let mainUrl = "";
        let hoverUrl = "";
        const detailUrls: string[] = [];

        // Duyệt qua các file trong folder
        for (const item of contents) {
          if (!item.Key) continue;
          const fileKey = item.Key;
          const fileName = path.basename(fileKey).toLowerCase();
          const url = getS3Url(fileKey);
          if (fileName.includes("main")) {
            mainUrl = url;
          } else if (fileName.includes("hover")) {
            hoverUrl = url;
          } else if (fileName.includes("detail")) {
            detailUrls.push(url);
          }
        }

        if (!mainUrl) {
          console.log(`Folder '${productFolder}' không có file main => bỏ qua`);
          continue;
        }

        // Tạo product trong DB
        const title = `Sản phẩm ${folderName} - ${productName}`;
        const price = 200000; // Giá mẫu, có thể cập nhật theo yêu cầu
        const discount = 0; // Giảm giá mẫu
        const description = `Tự động import từ folder: ${productFolder}`;
        const colors = JSON.stringify(["#000000", "#FFFFFF"]);
        const sizes = JSON.stringify(["S", "M"]);

        const product = await prisma.product.create({
          data: {
            category_id,
            title,
            price,
            discount,
            thumbnail: mainUrl,
            description,
            colors,
            sizes,
          },
        });
        console.log(`Đã tạo product id=${product.id}, title='${title}'`);

        // Chèn ảnh hover (nếu có)
        if (hoverUrl) {
          await prisma.gallery.create({
            data: {
              product_id: product.id,
              thumbnail: hoverUrl,
            },
          });
        }

        // Chèn các ảnh detail
        for (const durl of detailUrls) {
          await prisma.gallery.create({
            data: {
              product_id: product.id,
              thumbnail: durl,
            },
          });
        }

        console.log(
          `Chèn hover=${hoverUrl ? 1 : 0} và detail=${
            detailUrls.length
          } cho product id=${product.id}`
        );
      }
    }

    console.log("Hoàn tất import sản phẩm!");
  } catch (error) {
    console.error("Lỗi khi import sản phẩm:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importProducts().then(() => process.exit(0));
