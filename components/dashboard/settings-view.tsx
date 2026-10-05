"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AppearanceCard } from "@/components/dashboard/appearance-card"
import { InsetPanel, Stat } from "@/components/shared/inset-panel"
import { useAppStore } from "@/components/providers/app-store"
import { PAYOUT_METHODS } from "@/lib/countries"

export function SettingsView() {
  const { user, signOut } = useAppStore()
  const router = useRouter()
  if (!user) return null
  const seller = user.seller

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <AppearanceCard />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InsetPanel>
            <Stat label="Username" value={<span className="text-lg">@{user.username}</span>} />
          </InsetPanel>
          <InsetPanel>
            <Stat
              label="Signed in with"
              value={<span className="text-lg">{user.provider === "google" ? "Google" : "Email"}</span>}
              hint={<span className="break-all">{user.email}</span>}
            />
          </InsetPanel>
          {seller ? (
            <>
              <InsetPanel>
                <Stat
                  label="Payout method"
                  value={
                    <span className="text-lg">
                      {PAYOUT_METHODS.find((m) => m.value === seller.payoutMethod)?.label ??
                        seller.payoutMethod}
                    </span>
                  }
                  hint={seller.country}
                />
              </InsetPanel>
              <InsetPanel>
                <Stat
                  label="Proof of work"
                  value={<span className="text-lg">Submitted</span>}
                  hint={<span className="break-all">{seller.proofOfWorkUrl}</span>}
                />
              </InsetPanel>
            </>
          ) : (
            <InsetPanel className="text-sm text-muted-foreground sm:col-span-2">
              You haven&apos;t set up selling yet.
            </InsetPanel>
          )}
        </CardContent>
        <CardFooter>
          <Button
            size="pill"
            variant="outline"
            className="w-full"
            onClick={() => {
              signOut()
              router.push("/")
            }}
          >
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
