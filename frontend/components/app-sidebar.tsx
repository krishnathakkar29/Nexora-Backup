"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const data = {
  versions: ["1.0.1"],
  navMain: [
    // {
    //   title: "Overview",
    //   url: "/dashboard",
    //   items: [
    //     {
    //       title: "Dashboard",
    //       url: "/dashboard",
    //     },
    //   ],
    // },
    {
      title: "Mails",
      url: "#",
      items: [
        {
          title: "Send Mails",
          url: "/mail/send-mail",
        },
        {
          title: "History",
          url: "/mail/history",
        },
        {
          title: "Bulk Mails",
          url: "/mail/bulk-mail",
        },
      ],
    },
    {
      title: "Chat",
      url: "#",
      items: [
        {
          title: "Chat Docs",
          url: "/chat",
        },
      ],
    },
    {
      title: "Forms",
      url: "#",
      items: [
        {
          title: "Your forms",
          url: "/form",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/">
          <div className="flex gap-2 font-semibold text-lg items-end leading-none p-2">
            {/* <FramerLogoIcon className="size-6" /> */}
            {/* <img src="/logo.png" alt="Logo" className="h-6" /> */}
            Nexora
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Projects Section */}

        {/* Rest of the sidebar menu */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => {
                  const isActive = pathname === subItem.url;
                  
                  return (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton 
                        asChild
                        className={cn(
                          "transition-all duration-200 hover:bg-accent/50",
                          isActive && "bg-accent text-accent-foreground font-medium shadow-sm border-l-2 border-primary"
                        )}
                      >
                        <Link 
                          href={subItem.url}
                          className={cn(
                            "w-full",
                            isActive && "text-primary"
                          )}
                        >
                          {subItem.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
