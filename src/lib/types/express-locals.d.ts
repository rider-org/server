import { Session, User } from "@rider/models";

declare global {
  namespace Express {
    interface Locals {
      user: User | null;
      session: Session | null;
      cookie: Record<string, string | undefined>;
    }
  }
}
