import { createClient, OAuthStrategy, Tokens } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

const wixClient = createClient({
  auth: OAuthStrategy({
    clientId: env.NEXT_PUBLIC_WIX_CLIENT_ID,
  }),
});

export async function middleware(request: NextRequest) {}
