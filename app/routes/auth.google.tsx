import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("google", request, {
    successRedirect: "/protected",
    failureRedirect: "/login",
  });
};

export const loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("google", request, {
    successRedirect: "/protected",
    failureRedirect: "/login",
  });
};
