"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/components/providers/app-store"
import { THEME_OPTIONS } from "@/components/shared/theme-options"
import { initials } from "@/lib/format"

export function UserMenu() {
  const { user, hydrated, signOut } = useAppStore()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  if (!hydrated) return <Skeleton className="size-9 rounded-full" />

  if (!user) {
    return (
      <div className="flex items-center gap-1 sm:gap-3">
        <Button asChild variant="link" size="sm" className="font-semibold">
          <Link href="/signin">Login</Link>
        </Button>
        <Button asChild size="pill-sm" className="font-semibold">
          <Link href="/signin?mode=signup">Sign up</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-pill" className="size-9" aria-label="Account menu">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
              {initials(user.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-semibold text-foreground">@{user.username}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/library">Library</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/sell">{user.isSeller ? "New listing" : "Start selling"}</Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            signOut()
            router.push("/")
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
