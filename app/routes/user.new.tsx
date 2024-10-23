import { prisma } from '~/prisma.server';
import { Form, json, redirect, useActionData } from '@remix-run/react';
import type { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get('username')?.toString() || '';
  const password = formData.get('password')?.toString() || '';
  const fullName = formData.get('full_name')?.toString() || '';
  const address = formData.get('address')?.toString() || '';
  const telephone = formData.get('telephone')?.toString() || '';

  if (!username || !password) {
    return json({ error: 'Username dan password wajib diisi!' }, { status: 400 });
  }

  await prisma.user.create({
    data: {
      username,
      password,
      full_name: fullName,
      address,
      telephone,
    },
  });

  return redirect('/user');
}

interface ActionData {
  error?: string;
}

export default function NewUser() {
  const actionData = useActionData<ActionData>();
  return (
    <div>
      <h1>Buat User Baru</h1>
      {actionData?.error && <p style={{ color: 'red' }}>{actionData.error}</p>}
      <Form method="post">
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <input type="text" name="full_name" placeholder="Full Name" />
        <input type="text" name="address" placeholder="Address" />
        <input type="text" name="telephone" placeholder="Telephone" />
        <button type="submit">Submit</button>
      </Form>
      <a href="/user">Kembali ke Daftar User</a> {/* Link kembali ke /user */}
    </div>
  );
}
