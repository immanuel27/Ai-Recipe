"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DarkIcon, DocumentIcon, LogOutIcon, SettingsIcon, UserIcon } from "@/components/icons"
import { useAppStore } from "@/components/providers/app-store"
import { THEME_OPTIONS } from "@/components/shared/theme-options"

/** Profile, appearance and session. Opens from the avatar in the dock. */
export function AccountMenu({ children }: { children: React.ReactElement }) {
  const { user, signOut } = useAppStore()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <DarkIcon aria-hidden />
            Appearance
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  <Icon aria-hidden />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
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
