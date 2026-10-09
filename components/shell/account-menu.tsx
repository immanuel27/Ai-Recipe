"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DocumentIcon, LogOutIcon, SettingsIcon, UserIcon } from "@/components/icons"
import { useAppStore } from "@/components/providers/app-store"

/** Profile, settings and session. Opens from the avatar in the dock. */
export function AccountMenu({ children }: { children: React.ReactElement }) {
  const { user, signOut } = useAppStore()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={12} className="w-60">
        {user && (
          <>
            <DropdownMenuLabel className="flex flex-col gap-2 px-2 py-2">
              <span className="font-semibold text-foreground">{user.displayName ?? user.username}</span>
              <span className="type-meta font-normal text-muted-foreground">@{user.username}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon aria-hidden />
                Your profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile/settings">
                <SettingsIcon aria-hidden />
                Settings
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/credits">
            <DocumentIcon aria-hidden />
            Media credits
          </Link>
        </DropdownMenuItem>
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
             
              onSelect={() => {
                signOut()
                router.push("/")
              }}
            >
              <LogOutIcon aria-hidden />
              Log out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
