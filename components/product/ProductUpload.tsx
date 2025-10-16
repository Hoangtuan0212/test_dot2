// Component Upload Sản phẩm (components/product/ProductUpload.tsx)
import { useState } from "react";

export default function ProductUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn file trước khi upload.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const response = await fetch("/api/products/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType: file.type }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi lấy upload URL.");
      }

      const { uploadUrl, fileName } = await response.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Lỗi khi upload file lên S3.");
      }

      alert("Upload thành công: " + fileName);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
