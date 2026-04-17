import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AuthUser } from "../services/authApi";

type SessionCtx = {
  user: AuthUser | null;
  patchUser: (partial: Partial<AuthUser>) => void;
};

const SessionContext = createContext<SessionCtx | null>(null);

export function SessionProvider({
  user,
  patchUser,
  children,
}: {
  user: AuthUser | null;
  patchUser: (partial: Partial<AuthUser>) => void;
  children: ReactNode;
}) {
  const v = useMemo(() => ({ user, patchUser }), [user, patchUser]);
  return <SessionContext.Provider value={v}>{children}</SessionContext.Provider>;
}

export function useSession(): AuthUser | null {
  return useContext(SessionContext)?.user ?? null;
}

export function usePatchAuthUser(): (partial: Partial<AuthUser>) => void {
  const ctx = useContext(SessionContext);
  return (p) => {
    ctx?.patchUser(p);
  };
}
