import { auth } from "@/auth";
import { getUser } from "@/services/getUser";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Dashboard } from "../dashboard";

async function getData(id: string) {
  return getUser({ id });
}

export default async function Page({
  params,
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await auth();

  if (!session?.user?._id) {
    redirect("/api/auth/signin");
  }

  const userDataPromised = getData(session.user._id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <h2 className="text-muted-foreground">Welcome to your dashboard!</h2>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <Dashboard userDataPromised={userDataPromised} walletId={walletId} />
      </Suspense>
    </div>
  );
}
