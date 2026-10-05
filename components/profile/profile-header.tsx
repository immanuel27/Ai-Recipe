import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { InsetPanel } from "@/components/shared/inset-panel"
import { initials } from "@/lib/format"

/** Avatar, name, bio and stats. Shared by your own profile and public profiles. */
export function ProfileHeader({
  displayName,
  username,
  bio,
  avatarUrl,
  stats,
  action,
}: {
  displayName: string
  username: string
  bio?: string
  avatarUrl?: string
  stats: { label: string; value: React.ReactNode }[]
  /** One clear action, e.g. Edit profile or Share profile */
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <Avatar className="size-24 text-2xl ring-4 ring-background">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="bg-primary font-bold text-primary-foreground">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">{displayName}</h1>
            <p className="text-muted-foreground">@{username}</p>
            {bio ? (
              <p className="mt-1 max-w-prose text-sm text-balance">{bio}</p>
            ) : null}
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <InsetPanel key={s.label} className="flex flex-col items-center gap-1 px-2 sm:items-start sm:px-4">
              <dt className="label-caps">{s.label}</dt>
              <dd className="text-2xl font-bold tabular-nums">{s.value}</dd>
            </InsetPanel>
          ))}
        </dl>
      </CardContent>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  )
}
