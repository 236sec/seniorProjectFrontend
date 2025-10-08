"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
  const { data: session } = useSession();
  if (session) {
    return <button onClick={() => signOut()}>Sign Out</button>;
  }
  return <button onClick={() => signIn()}>Sign In</button>;
}
