"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { THEME_OPTIONS } from "@/components/shared/theme-options"

const subscribe = () => () => {}

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  // The saved theme is only known in the browser; avoid a mismatched first render
  const mounted = React.useSyncExternalStore(subscribe, () => true, () => false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Appearance</CardTitle>
        <CardDescription>Choose light or dark, or match your device.</CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          type="single"
          spacing={3}
          value={mounted ? theme : undefined}
          onValueChange={(v) => v && setTheme(v)}
          aria-label="Theme"
          className="grid w-full grid-cols-3"
        >
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="h-auto! flex-col gap-2 rounded-lg! bg-muted px-3! py-4! font-medium text-muted-foreground ring-1 ring-transparent data-[state=on]:bg-primary/10! data-[state=on]:text-primary data-[state=on]:ring-primary/40"
            >
              <Icon className="size-5!" aria-hidden />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>
    </Card>
  )
}
