"use client";

import {
  BookOpen,
  BotIcon,
  Settings2,
  SquareTerminal,
  Wallet,
} from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { NavHead } from "@/components/nav-head";
import { NavMain } from "@/components/nav-main";
import { NavUser, NavUserProps } from "@/components/nav-user";
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
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: BookOpen,
    },
    {
      title: "Wallet Inspector",
      url: "/wallet-inspector",
      icon: Wallet,
    },
    {
      title: "Indicators",
      url: "/indicators",
      icon: Settings2,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: BotIcon,
    },
    {
      title: "AI",
      url: "/ai",
      icon: BotIcon,
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
        {session ? (
          <NavUser user={session.user as NavUserProps["user"]} />
        ) : (
          <SignInButton />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
