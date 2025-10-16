import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 🧩 Check session
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  const userId = Number(session.user?.id);
  if (!userId) {
    return res.status(400).json({ message: "Không xác định được userId" });
  }

  // 📦 Process the request
}
