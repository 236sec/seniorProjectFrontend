import { auth } from "@/auth";
import { getUser } from "@/services/getUser";

async function getUserData(userId: string) {
  return getUser({ id: userId });
}

export default async function Page() {
  const session = await auth();

  // const userData = getUserData(session!.user._id);

  return (
    <>
      <h1>Dashboard</h1>
      <h2>Welcome to your dashboard!</h2>
      {/* <DashboardData userData={userData} /> */}
    </>
  );
}
