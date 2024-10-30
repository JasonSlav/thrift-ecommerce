import { prisma } from '~/prisma.server';
import { Form, json, redirect, useActionData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/utils/auth.server';

type ActionData = { error?: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (user) return redirect('/protected');
  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "google") {
    return authenticator.authenticate("google", request, {
      successRedirect: "/protected",
      failureRedirect: "/login",
    });
  }

  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const full_name = formData.get("full_name") as string;
    const address = formData.get("address") as string;
    const telephone = formData.get("telephone") as string;

    if (!username || !password || !full_name || !address || !telephone) {
      return json<ActionData>({ error: "Semua field harus diisi" });
    }

    const existingUser = await prisma.user.findFirst({ where: { username } });
    if (existingUser) {
      return json<ActionData>({ error: "Username sudah terdaftar" });
    }

    await prisma.user.create({
      data: { username, password, full_name, address, telephone },
    });

    return redirect('/login');
  } catch {
    return json<ActionData>({ error: "Terjadi kesalahan saat mendaftar" });
  }
};

export default function LoginPage() {
  const actionData = useActionData<ActionData>();

  return (
    
    <div className="login-container">
      <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
    />
      <div className="login-card">
        {/* Icon User */}
        <div className="login-icon">
          <i className="fas fa-user-circle"></i>
        </div>

        {/* Title */}
        <h2>Login Account</h2>

        {actionData?.error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {actionData.error}
          </div>
        )}



        <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Login dengan Google</h2>
        <Form action="/auth/google" method="post">
          <button
            type="submit"
            className="w-full border border-gray-300 px-4 py-2 rounded flex items-center justify-center gap-2"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </Form>
      </div>

      <div className="relative mb-8">
        <hr className="border-gray-300" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-gray-500">
          atau
        </span>
      </div>

        {/* <Form method="post" className="space-y-4">
        <input type="hidden" name="intent" value="register" />
        <input type="text" name="username" required placeholder="Username" />
        <input type="password" name="password" required placeholder="Password" />
        <input type="text" name="full_name" required placeholder="Nama Lengkap" />
        <textarea name="address" required placeholder="Alamat" rows={3} />
        <input type="tel" name="telephone" required placeholder="Nomor Telepon" />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          Register
        </button>
      </Form>
        {/* Login Form */}
        <Form method="post">
          <div className="input-group">
            <label htmlFor="username">Email/Username</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              placeholder="Email/Username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Password"
            />
            <i className="fas fa-eye"></i>
          </div>

          <div className="forgot-password">
            <a href="#">Lupa sandi?</a>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </Form>

        {/* Register Link */}
        <div className="signup-link">
          <span>Belum terdaftar? </span>
          <a href="#">Buat akun</a>
        </div>

        {/* Footer */}
        <footer>
          Copyright <i className="far fa-copyright"></i> 2024 ThriftEase
        </footer>
      </div>
    </div>
  );
}
