import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/themeButton";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen p-6 pt-2">
        <div className="flex justify-between">
          <SidebarTrigger />
          <ModeToggle />
        </div>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
