import { auth } from "@/auth";
import { getUser } from "@/services/getUser";
import { Suspense } from "react";
import { Dashboard } from "./dsahboard";

async function getData(id: string) {
  return getUser({ id });
}

export default async function Page() {
  const session = await auth();
  const userDataPromised = getData(session!.user._id);
  return (
    <>
      <h1>Dashboard</h1>
      <h2>Welcome to your dashboard!</h2>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <Dashboard userDataPromised={userDataPromised} />
      </Suspense>
    </>
  );
}
