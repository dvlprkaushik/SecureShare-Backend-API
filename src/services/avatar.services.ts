import { prisma } from "@/utils/prisma.js";
import { StorageError } from "@/utils/StorageError.js";

export const updateAvatarKey = async (userId: number, avatarKey: string) => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { avatarKey: avatarKey },
    });
  } catch (err) {
    throw new StorageError("DATABASE_ERROR", "Failed to update avatar");
  }
};

export const getUserAvatarKey = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarKey: true },
  });

  if (!user) throw new StorageError("USER_NOT_FOUND");
  return user.avatarKey;
};
