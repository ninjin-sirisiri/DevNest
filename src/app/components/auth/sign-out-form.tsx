"use client";

import { signOut } from "next-auth/react";
import { useLocale } from "../../contexts/index";

export default function SignOut() {
  const { locale } = useLocale();

  return <button onClick={() => signOut()}>{locale("auth.sign_out")}</button>;
}
