import { prisma } from '~/prisma.server';
import { Form, json, redirect, useActionData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/utils/auth.server';
import bcrypt from 'bcryptjs';

type ActionData = { error?: string };

// Loader untuk redirect jika user sudah login
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (user) return redirect('/protected');
  return null;
}

// Action untuk menangani register
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  // Mendapatkan data dari form
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const address = formData.get("address") as string;
  const telephone = formData.get("telephone") as string;

  // Validasi data form
  if (!username || !password) {
    return json<ActionData>({ error: "Username dan password harus diisi" });
  }

  try {
    // Register user baru
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        full_name,
        address,
        telephone,
      },
    });
    return redirect("/login");
  } catch (error) {
    return json<ActionData>({ error: "Terjadi kesalahan saat proses registrasi" });
  }
};

export default function RegisterPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-center text-xl font-bold">Register</h2>

      {/* Form Register */}
      <Form method="post" className="space-y-4">
        <input type="text" name="username" required placeholder="Username" className="input" />
        <input type="password" name="password" required placeholder="Password" className="input" />
        <input type="text" name="full_name" required placeholder="Nama Lengkap" className="input" />
        <textarea name="address" required placeholder="Alamat" rows={3} className="input" />
        <input type="tel" name="telephone" required placeholder="Nomor Telepon" className="input" />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Register</button>
      </Form>

      {actionData?.error && <p className="text-red-500 text-center mt-4">{actionData.error}</p>}
    </div>
  );
}
