import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    if (!idToAdd) {
      return new Response("This person does not exist", { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // If user tries to add himself
    if (idToAdd === session.user.id) {
      return new Response("You can not add yourself as a friend", {
        status: 400,
      });
    }

    // If user tries to send friend request more then once
    const isAlreadyAdded = (await fetchRedis(
      `sismember`,
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already added friend", { status: 400 });
    }
    // If user is alread friend
    const isAlreadyFriend = (await fetchRedis(
      `sismember`,
      `user:${session.user.id}:friends`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already friend with that user", { status: 400 });
    }

    //valid request => addfriend

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
