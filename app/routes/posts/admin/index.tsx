import { Link } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { requireAdminUser } from "~/session.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUser(request);
  return json({});
};

export default function AdminIndexRoute() {
  return (
    <Link to="new" className="text-blue-600 underline">
      Create new post
    </Link>
  );
}
