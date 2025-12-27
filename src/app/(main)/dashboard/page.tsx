import { auth } from "@/auth";
import { getUser } from "@/services/getUser";
import { Suspense } from "react";
import { Dashboard } from "./dashboard";
import { DashboardTokenSelect } from "./token-select";

async function getData(id: string) {
  return getUser({ id });
}

export default async function Page() {
  const session = await auth();
  const userDataPromised = getData(session!.user._id);
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <h2 className="text-muted-foreground">Welcome to your dashboard!</h2>
      </div>

      <DashboardTokenSelect />

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <Dashboard userDataPromised={userDataPromised} />
      </Suspense>
    </div>
  );
}
