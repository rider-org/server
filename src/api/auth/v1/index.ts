import { generateSession, setSessionTokenCookie } from "@/lib/auth";
import { google } from "@/lib/auth/providers";
import cookieGen from "@/lib/cookie-gen";
import { db } from "@/lib/db";
import { sendSuperJson } from "@/lib/superjson-sender";
import { createUser, findUserByGoogleId, User } from "@rider/models";
import { attempt } from "@rider/packages";
import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { Router } from "express";

export const authRouterV1 = Router();

authRouterV1.get("/validate", (_, res) => {
  const session = res.locals.session;
  const user = res.locals.user;

  if (!session || !user) {
    return sendSuperJson(res, 401, {
      success: false,
      message: "You are not authenticated.",
    });
  }

  return sendSuperJson(res, 200, {
    success: true,
    message: "You are authenticated!",
    data: {
      user,
      session,
    },
  });
});

authRouterV1.get("/google", (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  res.appendHeader(
    "Set-Cookie",
    cookieGen({
      name: "google_oauth_state",
      value: state,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      sameSite: "Lax",
    }),
  );
  res.appendHeader(
    "Set-Cookie",
    cookieGen({
      name: "google_oauth_verifier",
      value: codeVerifier,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      sameSite: "Lax",
    }),
  );

  res.redirect(url.toString());
});

authRouterV1.get("/google/callback", async (req, res) => {
  // Doesn't matter if we just use http here, we just need to use the URL object to find the params on the URL.
  const url = new URL(`http://${process.env.URL ?? "localhost"}${req.url}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const storedState = res.locals.cookie["google_oauth_state"] ?? null;
  const codeVerifier = res.locals.cookie["google_oauth_verifier"] ?? null;

  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return res.redirect(`${process.env.WEB_URL}/error?c=0`);
  }

  if (state !== storedState) {
    return res.redirect(`${process.env.WEB_URL}/error?c=0`);
  }

  const [tokensError, tokens] = await attempt(
    google.validateAuthorizationCode(code, codeVerifier),
  );

  if (tokensError || !tokens) {
    return res.redirect(`${process.env.WEB_URL}/error?c=0`);
  }

  const claims = decodeIdToken(tokens.idToken()) as {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    email: string;
    email_verified: boolean;
    at_hash: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    iat: number;
    exp: number;
  };

  const googleId = claims.sub;
  const email = claims.email;

  const [existingUserError, existingUser] = await attempt(
    findUserByGoogleId({ googleId }, db),
  );

  if (existingUserError) {
    return res.redirect(`${process.env.WEB_URL}/error?c=0`);
  }

  let user: User;
  if (!existingUser) {
    const [newUserError, newUser] = await attempt(
      createUser({ email, googleId }, db),
    );

    if (newUserError || newUser === null) {
      return res.redirect(`${process.env.WEB_URL}/error?c=0`);
    }

    user = newUser;
  } else {
    user = existingUser;
  }

  const [sessionError, session] = await attempt(generateSession(user.id));

  console.log(sessionError);

  if (sessionError || !session) {
    return res.redirect(`${process.env.WEB_URL}/error?c=0`);
  }

  setSessionTokenCookie(res, session.id, session.expiresAt);
  return res.redirect(`${process.env.WEB_URL}/success?c=0`);
});
