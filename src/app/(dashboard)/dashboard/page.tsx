import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Add from "./add/page";

const Dashboard = async () => {
  const session = await getServerSession(authOptions);

  return <Add />;
};
export default Dashboard;
