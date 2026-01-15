import { auth } from "@/auth";
import { getUser } from "@/services/getUser";
import { Suspense } from "react";
import ChatbotPage from "./chat-bot-page";

async function getData(id: string) {
  return getUser({ id });
}

export default async function Page() {
  const session = await auth();
  const userData = await getData(session!.user._id);
  return (
    <div className="w-9/12 flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Chatbot Page</h1>
      </div>
      <Suspense fallback={<div>Loading chatbot...</div>}>
        <ChatbotPage userData={userData} />
      </Suspense>
    </div>
  );
}
