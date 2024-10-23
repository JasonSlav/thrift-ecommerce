import { Outlet } from '@remix-run/react';

export default function UserLayout() {
  return (
    <div>
      <h1>User Management</h1>
      <Outlet />
    </div>
  );
}