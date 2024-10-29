import { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  return { user };
};
export default function ProtectedRoute() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Protected Route</h1>
      <p>Welcome {user.profile?.name}!</p>
      <Link to="/user">User</Link>
    </div>
  );
}
