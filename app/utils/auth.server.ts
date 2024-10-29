import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { createCookieSessionStorage } from "@remix-run/node";

// User type
type User = {
  id: string;
  email: string;
  profile?: {
    name?: string;
    avatar?: string;
  };
};

// Session storage dengan konfigurasi tambahan
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET || "s3cr3t"],
    secure: process.env.NODE_ENV === "production",
    
    // Opsi untuk membatasi session:
    maxAge: 60 * 60 * 24, // Session berakhir setelah 24 jam
    // ATAU
    expires: new Date(Date.now() + 60_000), // Session berakhir dalam 1 menit
  },
});

// Authenticator setup
export const authenticator = new Authenticator<User>(sessionStorage);

// Google strategy
authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:5173/auth/google/callback",
    },
    async ({ profile }) => {
      // ... handle profile ...
      return {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      };
    }
  )
);

// Fungsi untuk memeriksa dan memperbarui session
export async function checkSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  // Cek waktu terakhir aktivitas
  const lastActivity = session.get("lastActivity");
  const now = Date.now();
  
  // Jika tidak ada aktivitas dalam 30 menit, logout
  if (lastActivity && now - lastActivity > 30 * 60 * 1000) {
    return logout(request);
  }

  // Update waktu aktivitas terakhir
  session.set("lastActivity", now);
  
  return session;
}

// Gunakan di route yang memerlukan autentikasi
export async function requireUser(request: Request) {
  // Cek session terlebih dahulu
  await checkSession(request);
  
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
}

// Fungsi untuk logout
export async function logout(request: Request) {
  await authenticator.logout(request, { redirectTo: "/login" });
}
