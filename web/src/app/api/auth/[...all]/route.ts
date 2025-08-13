import { auth } from "@/_lib/_auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Force dynamic rendering - prevents build-time execution
export const dynamic = "force-dynamic";

export const { POST, GET } = toNextJsHandler(auth);