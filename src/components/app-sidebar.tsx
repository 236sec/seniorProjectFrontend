"use client";

import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { NavHead } from "@/components/nav-head";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import SignInButton from "./signInButton";

const data = {
  head: {
    name: "My Application",
    url: "/",
    icon: SquareTerminal,
  },
  navMain: [
    {
      title: "Playground",
      url: "/playground",
      icon: SquareTerminal,
    },
    {
      title: "Models",
      url: "/models",
      icon: Bot,
    },
    {
      title: "Documentation",
      url: "/documentation",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Add isActive based on current pathname
  const navMainWithActive = data.navMain.map((item) => ({
    ...item,
    isActive: pathname === item.url,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHead head={data.head} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
      </SidebarContent>
      <SidebarFooter>
        {session ? <NavUser user={session.user} /> : <SignInButton />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
