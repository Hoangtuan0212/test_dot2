import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "../../lib/prisma";
import AccountLayout from "../../components/AccountLayout";
import styles from "../../styles/addresses.module.css";
import { useState } from "react";
import { Pencil, Trash } from "lucide-react";

// Kiểm tra session
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      include: { address: true },
    });

    if (!user) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    return {
      props: {
        addresses: JSON.parse(JSON.stringify(user.address || [])),
      },
    };
  } catch (error) {
    console.error("Lỗi truy vấn Prisma:", error);
    return {
      props: {
        addresses: [],
      },
    };
  }
}

export default function AddressesPage({ addresses }) {
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  // Xoá địa chỉ
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xoá địa chỉ này?")) return;
    try {
      // Phải có credentials: "include" để cookie session được gửi
      const res = await fetch(`/api/address/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert("Xoá địa chỉ thành công!");
        window.location.reload();
      } else {
        const err = await res.json();
        alert("Lỗi xoá địa chỉ: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi xoá địa chỉ!");
    }
  };

  return (
    <AccountLayout>
      <h1 className={styles.heading}>Thông tin địa chỉ</h1>
      <div className={styles.twoCol}>
        {/* Cột trái: danh sách địa chỉ */}
        <div className={styles.leftCol}>
          {addresses.length === 0 ? (
            <p>Bạn chưa có địa chỉ nào.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className={styles.addressItem}>
                {/* Header */}
                <div className={styles.addressItemHeader}>
                  <div className={styles.addressTitle}>
                    <strong>
                      {addr.firstName} {addr.lastName}
                    </strong>
                    {addr.isDefault && (
                      <span className={styles.defaultBadge}>
                        (Địa chỉ mặc định)
                      </span>
                    )}
                  </div>
                  <div className={styles.addressActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => {
                        setEditAddress(addr);
                        setShowForm(true);
                      }}
                      title="Chỉnh sửa địa chỉ"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(addr.id)}
                      title="Xoá địa chỉ"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
                {/* Body */}
                <div className={styles.addressItemBody}>
                  <p>
                    <strong>Công ty:</strong> {addr.company || "(Không có)"}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {addr.street}
                    {addr.street2 ? `, ${addr.street2}` : ""}, {addr.city},{" "}
                    {addr.country}
                  </p>
                  <p>
                    <strong>Mã bưu điện:</strong> {addr.zipCode || ""}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {addr.phone || ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cột phải: form */}
        <div className={styles.rightCol}>
          {!showForm && (
            <button
              className={styles.addBtn}
              onClick={() => {
                setShowForm(true);
                setEditAddress(null);
              }}
            >
              NHẬP ĐỊA CHỈ MỚI
            </button>
          )}
          {showForm && (
            <AddressForm
              onClose={() => {
                setShowForm(false);
                setEditAddress(null);
              }}
              existingAddress={editAddress}
            />
          )}
        </div>
      </div>
    </AccountLayout>
  );
}

function AddressForm({ onClose, existingAddress }) {
  const isEditing = !!existingAddress;

  const [firstName, setFirstName] = useState(existingAddress?.firstName || "");
  const [lastName, setLastName] = useState(existingAddress?.lastName || "");
  const [company, setCompany] = useState(existingAddress?.company || "");
  const [phone, setPhone] = useState(existingAddress?.phone || "");
  const [street, setStreet] = useState(existingAddress?.street || "");
  const [street2, setStreet2] = useState(existingAddress?.street2 || "");
  const [city, setCity] = useState(existingAddress?.city || "");
  const [state, setState] = useState(existingAddress?.state || "");
  const [country, setCountry] = useState(existingAddress?.country || "");
  const [zipCode, setZipCode] = useState(existingAddress?.zipCode || "");
  const [isDefault, setIsDefault] = useState(
    existingAddress?.isDefault || false
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // PUT /api/address/[id]
        const res = await fetch(`/api/address/${existingAddress.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Gửi cookie session
          body: JSON.stringify({
            firstName,
            lastName,
            company,
            phone,
            street,
            street2,
            city,
            state,
            country,
            zipCode,
            isDefault,
          }),
        });
        if (res.ok) {
          alert("Cập nhật địa chỉ thành công!");
          window.location.reload();
        } else {
          const errorData = await res.json();
          alert("Lỗi khi cập nhật địa chỉ: " + errorData.message);
        }
      } else {
        // POST /api/address
        const res = await fetch("/api/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Gửi cookie session
          body: JSON.stringify({
            firstName,
            lastName,
            company,
            phone,
            street,
            street2,
            city,
            state,
            country,
            zipCode,
            isDefault,
          }),
        });
        if (res.ok) {
          alert("Thêm địa chỉ thành công!");
          window.location.reload();
        } else {
          const errorData = await res.json();
          alert("Lỗi khi thêm địa chỉ: " + errorData.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra!");
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <h2>{isEditing ? "CHỈNH SỬA ĐỊA CHỈ" : "NHẬP ĐỊA CHỈ MỚI"}</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.formBody}>
        <div className={styles.formGroup}>
          <label>Họ</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Tên</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Công ty</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Số điện thoại</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Địa chỉ 1</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Địa chỉ 2</label>
          <input
            type="text"
            value={street2}
            onChange={(e) => setStreet2(e.target.value)}
            placeholder="(Không bắt buộc)"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Thành phố</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Tỉnh / Bang</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="VD: TP.HCM"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Quốc gia</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Mã bưu điện</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="(Không bắt buộc)"
          />
        </div>
        <div className={styles.formGroupCheckbox}>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <label>Đặt làm địa chỉ mặc định</label>
        </div>
        <div className={styles.btnGroup}>
          <button type="submit" className={styles.btnPrimary}>
            {isEditing ? "CẬP NHẬT" : "THÊM MỚI"}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
          >
            hoặc Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
