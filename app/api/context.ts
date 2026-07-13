import * as cookie from "cookie";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "./lib/admin-session";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  isAdmin: boolean;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders, isAdmin: false };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  const cookies = cookie.parse(opts.req.headers.get("cookie") || "");
  ctx.isAdmin = isValidAdminSession(cookies[ADMIN_SESSION_COOKIE]);
  return ctx;
}
