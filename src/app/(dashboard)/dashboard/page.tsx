import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";
import Add from "./add/page";

const page = async () => {
  const session = await getServerSession(authOptions);

  return <Add />;
};
export default page;
