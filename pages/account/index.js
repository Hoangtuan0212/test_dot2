// pages/account/index.js
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]"; // Đảm bảo đường dẫn đúng
import prisma from "../../lib/prisma";
import AccountLayout from "../../components/AccountLayout";
import styles from "../../styles/account.module.css";

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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
      user: JSON.parse(JSON.stringify(user)),
    },
  };
}

export default function AccountPage({ user }) {
  return (
    <AccountLayout>
      <h1 className={styles.heading}>Tài khoản của bạn</h1>
      <div className={styles.info}>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Họ tên:</strong> {user.lastName} {user.firstName}
        </p>
        <p>
          <strong>Giới tính:</strong> {user.gender}
        </p>
      </div>

      <h2 className={styles.subHeading}>Lịch sử mua hàng</h2>
      <p>Bạn chưa đặt mua sản phẩm.</p>
    </AccountLayout>
  );
}
