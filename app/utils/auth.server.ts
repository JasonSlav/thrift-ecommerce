import { Authenticator, Strategy } from "remix-auth";
import { createCookieSessionStorage } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { prisma } from "~/prisma.server";

type User = {
  id_user: number;
  username: string;
  provider: string;
};

// Session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET || "s3cr3t"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  },
});

// Authenticator setup
export const authenticator = new Authenticator<User>(sessionStorage);

interface LocalAuthOptions {
  username: string;
  password: string;
}

class LocalAuthStrategy extends Strategy<User, LocalAuthOptions> {
  name = "local";

  constructor() {
    super(LocalAuthStrategy.verifyUser); // Panggil metode statis untuk verifikasi
  }

  static async verifyUser(username: string, password: string, done: (error: any, user?: User | null) => void): Promise<void> {
    if (!username || !password) {
      return done(new Error("Username dan password harus diisi")); // Use done callback
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return done(new Error("Username atau password salah")); // Use done callback
    }

    return done(null, { id_user: user.id_user, username: user.username, provider: "local" }); // Use done callback
  }

  async authenticate(request: Request, options: Record<string, any> = {}) {
    const body = await request.formData();
    const username = body.get("username") as string; // Cast to string
    const password = body.get("password") as string; // Cast to string

    // Logika otentikasi manual
    const user: string = await LocalAuthStrategy.verifyUser(username, password);
    if (!user) {
      throw new Error("Otentikasi gagal");
    }
    return user;
  }
}

// Implementasikan custom strategy
authenticator.use(new LocalAuthStrategy());
