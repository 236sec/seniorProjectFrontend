import SignInButton from "@/components/signInButton";
import { ModeToggle } from "@/components/themeButton";

export default function Unauthorized() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold">Unauthorized Access</h1>
        <p className="text-center sm:text-left">
          You do not have permission to view this page. Please sign in with an
          authorized account.
        </p>
        <SignInButton />
        <ModeToggle />
      </main>
    </div>
  );
}
