import { prisma } from '~/prisma.server';
import { Form, json, redirect, useActionData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/utils/auth.server';

// Tipe untuk action data
type ActionData = {
  error?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Cek apakah user sudah login
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    return redirect('/protected'); // atau '/user'
  }
  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "google") {
    // Perbaikan: Langsung return authenticator tanpa await
    return authenticator.authenticate("google", request, {
      successRedirect: "/ ",
      failureRedirect: "/login",
    });
  }

  // Handle manual registration
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const full_name = formData.get("full_name") as string;
    const address = formData.get("address") as string;
    const telephone = formData.get("telephone") as string;

    // Validasi input
    if (!username || !password || !full_name || !address || !telephone) {
      return json<ActionData>({ 
        error: "Semua field harus diisi" 
      });
    }

    // Cek apakah username sudah terdaftar
    const existingUser = await prisma.user.findFirst({
      where: { username }
    });

    if (existingUser) {
      return json<ActionData>({ 
        error: "Username sudah terdaftar" 
      });
    }

    // Buat user baru
    await prisma.user.create({
      data: {
        username,
        password, // Idealnya password di-hash dulu
        full_name,
        address,
        telephone,
      }
    });
    
    return redirect('/login');
  } catch (error) {
    return json<ActionData>({ 
      error: "Terjadi kesalahan saat mendaftar" 
    });
  }
};

export default function LoginPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Login / Register</h1>
      
      {/* Error message */}
      {actionData?.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      {/* Google Login */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Login dengan Google</h2>
        <Form action="/auth/google" method="post">
          {/* Perbaikan: Hapus input hidden dan langsung gunakan route /auth/google */}
          <button
            type="submit"
            className="w-full bg-white border border-gray-300 px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <img 
              src="/google-icon.png" 
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

      {/* Manual Registration Form */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Register Manual</h2>
        <Form method="post" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="full_name"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Alamat
            </label>
            <textarea
              name="address"
              className="w-full border rounded px-3 py-2"
              required
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nomor Telepon
            </label>
            <input
              type="tel"
              name="telephone"
              className="w-full border rounded px-3 py-2"
              required
              pattern="[0-9]*"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </Form>
      </div>

      <div className="mt-6 text-center">
        <a 
          href="/" 
          className="text-blue-500 hover:underline"
        >
          Kembali ke Home
        </a>
      </div>
    </div>
  );
}
