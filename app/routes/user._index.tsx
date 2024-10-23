import { prisma } from '~/prisma.server';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({}: LoaderFunctionArgs) {
  const users = await prisma.user.findMany();
  return users;
}

export default function UserList() {
  const users = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Daftar User</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id_user}>
            {user.username} - {user.full_name} - {user.telephone}
          </li>
        ))}
      </ul>
      <a href="/">Kembali ke Home</a> {/* Link kembali ke halaman utama */}
    </div>
  );
}
