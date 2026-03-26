import "server-only";

import { assertAuthenticated } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function ensureSessionUserRecord() {
  const user = await assertAuthenticated();

  const record = await prisma.user.upsert({
    where: {
      email: user.email
    },
    update: {
      name: user.name,
      role: user.role,
      status: "ACTIVE",
      lastSeenAt: new Date()
    },
    create: {
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
