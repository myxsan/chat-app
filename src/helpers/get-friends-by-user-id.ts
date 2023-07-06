import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  // retreive friends for the current user
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    friendIds.map(async (id) => {
      const friend = (await fetchRedis("get", `user:${id}`)) as string;
      return JSON.parse(friend) as User;
    })
  );

  return friends;
};
