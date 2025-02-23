import { db } from "@/lib/db";
import {
  createSession,
  User,
  Session,
  findSessionById,
  findUserById,
  deleteSessionById,
  updateSessionById,
  deleteSessionsByUserId,
} from "@rider/models";
import { attempt } from "@rider/packages";

const DAYS_TILL_EXPIRE = 30;

const calculateExpiresAt = () => {
  const now = new Date();
  now.setDate(now.getDate() + DAYS_TILL_EXPIRE);
  return now;
};

export async function generateSession(userId: string): Promise<Session> {
  const [sessionError, session] = await attempt(
    createSession({ userId, expiresAt: calculateExpiresAt() }, db),
  );

  if (!session || sessionError) {
    throw new Error(`Failed to generate session: ${sessionError}`);
  }

  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const [sessionError, session] = await attempt(
    findSessionById({ id: token }, db),
  );

  if (!session || sessionError) {
    return { session: null, user: null };
  }

  const [userError, user] = await attempt(
    findUserById({ id: session.userId }, db),
  );

  if (!user || userError) {
    return { session: null, user: null };
  }

  const now = Date.now();

  if (now >= session.expiresAt.getTime()) {
    deleteSessionById({ id: session.id }, db);
    return { session: null, user: null };
  }

  if (
    now >=
    session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * (DAYS_TILL_EXPIRE / 2)
  ) {
    const expiresAt = calculateExpiresAt();
    const [error, successBool] = await attempt(
      updateSessionById({ id: session.id, deletedAt: expiresAt }, db),
    );

    if (error) {
      return { user, session };
    }

    if (!successBool) {
      return { user, session };
    }

    session.expiresAt = expiresAt;
  }

  return { user, session };
}

export async function invalidateSession(sessionId: string): Promise<boolean> {
  const [sessionError, sessionDeleted] = await attempt(
    deleteSessionById({ id: sessionId }, db),
  );

  if (sessionError) {
    return false;
  }

  return sessionDeleted;
}

export async function invalidateAllSessions(userId: string): Promise<boolean> {
  const [sessionsError, sessionsDeleted] = await attempt(
    deleteSessionsByUserId({ userId }, db),
  );

  if (sessionsError) {
    return false;
  }

  return sessionsDeleted;
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
