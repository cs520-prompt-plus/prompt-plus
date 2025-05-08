"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { IconBrandTabler, IconUserBolt } from "@tabler/icons-react";
import { motion } from "motion/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";
import { SkeletonWrapper } from "../ui/skeleton-wrapper";
import { useRouter } from "next/navigation"; // ✅ App Router version

export function SideBarWrapper({ children }: { children: React.ReactNode }) {
  const currentPath = usePathname();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  const links = [
    {
      label: "Playground",
      href: "main",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Saved Presets",
      href: "#",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      router.push("/main");
    }
  }, [status, router]);
  if (status === "loading") {
    return <Skeleton className="h-screen w-screen" />;
  }
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen" // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      {status === "authenticated" && (
        <SkeletonWrapper
          loading={!isClient}
          outerClassName="h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] shrink-0"
        >
          <Sidebar open={open} setOpen={setOpen} animate={false}>
            <SidebarBody className="justify-between gap-10">
              <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                <>
                  <Logo />
                </>
                <div className="mt-8 flex flex-col gap-2">
                  {links.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
              </div>
              <div>
                <SidebarLink
                  link={{
                    label: session?.user?.name ?? "User",
                    href: "#",
                    icon: status === "authenticated" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Image
                            src={(session.user?.image as string) ?? ""}
                            className="h-7 w-7 shrink-0 rounded-full"
                            width={50}
                            height={50}
                            alt="Avatar"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem>
                              <p className="font-semibold">
                                {session.user?.email}
                              </p>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              color="danger"
                              onClick={() =>
                                signOut({ callbackUrl: currentPath })
                              }
                            >
                              Log Out
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ),
                  }}
                />
              </div>
            </SidebarBody>
          </Sidebar>
        </SkeletonWrapper>
      )}

      {children}
    </div>
  );
}
export const Logo = () => {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Prompt plus
      </motion.span>
    </div>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};
