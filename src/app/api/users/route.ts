import { auth } from "@/auth";
import { getUser } from "@/services/getUser";

function fetchUserData(userId: string) {
  return getUser({ id: userId });
}

export async function GET(): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user?._id) {
      return Response.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const userData = await fetchUserData(session.user._id);

    if (!userData) {
      return Response.json({ error: "User data not found" }, { status: 404 });
    }

    return Response.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
