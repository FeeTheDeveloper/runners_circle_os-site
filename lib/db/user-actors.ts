import "server-only";

import { assertAuthenticated } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function ensureSessionUserRecord() {
  const user = await assertAuthenticated();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          id: user.id
        },
        {
          email: user.email
        }
      ]
    },
    select: {
      id: true
    }
  });

  const record = existingUser
    ? await prisma.user.update({
        where: {
          id: existingUser.id
        },
        data: {
          email: user.email,
          name: user.name,
          role: user.role,
          status: "ACTIVE",
          lastSeenAt: new Date()
        },
        select: {
          id: true
        }
      })
    : await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: "ACTIVE",
          lastSeenAt: new Date()
        },
        select: {
          id: true
        }
      });

  return {
    user,
    userId: record.id
  };
}
