import { Form, json, redirect, useActionData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/utils/auth.server';

type ActionData = { error?: string };

// Loader untuk redirect jika user sudah login
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (user) return redirect('/protected');
  return null;
}

// Action untuk menangani login
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return json<ActionData>({ error: "Username dan password harus diisi" });
  }

  try {
    // Login dengan authenticator lokal
    const user = await authenticator.authenticate("local", request, {
      successRedirect: "/protected",
      failureRedirect: "/login",
    });
    return user;
  } catch (error) {
    return json<ActionData>({ error: "Username atau password salah" });
  }
}

export default function LoginPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login Account</h2>

        {actionData?.error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {actionData.error}
          </div>
        )}

        <Form method="post">
          <input type="text" name="username" required placeholder="Email/Username" />
          <input type="password" name="password" required placeholder="Password" />
          <button type="submit" className="login-button">Login</button>
        </Form>

        {/* Login dengan Google */}
        <Form action="/auth/google" method="post">
          <button type="submit" className="login-button">Login dengan Google</button>
        </Form>
      </div>
    </div>
  );
}
