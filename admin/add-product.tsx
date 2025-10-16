import { useState } from "react";

export default function AddProduct() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Vui lòng chọn một file ảnh!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.fileUrl) {
        setImageUrl(data.fileUrl);
      } else {
        alert(data.message || "Lỗi khi upload ảnh!");
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      alert("Đã xảy ra lỗi khi tải ảnh lên!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !price || !imageUrl) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: productName,
          price: Number(price), // Chuyển đổi price thành number
          image: imageUrl,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Thêm sản phẩm thành công!");
        setProductName("");
        setPrice("");
        setImageUrl("");
        setFile(null);
      } else {
        alert(data.message || "Lỗi khi thêm sản phẩm!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert("Đã xảy ra lỗi khi thêm sản phẩm!");
    }
  };

  return (
    <div>
      <h1>Thêm sản phẩm mới</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên sản phẩm"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Giá sản phẩm"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="button" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Đang tải lên..." : "Upload ảnh"}
        </button>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              marginTop: "10px",
            }}
          />
        )}

        <button type="submit">Thêm sản phẩm</button>
      </form>
    </div>
  );
}
