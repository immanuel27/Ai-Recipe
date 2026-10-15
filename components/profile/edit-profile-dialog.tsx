"use client"

import * as React from "react"
import { PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/components/providers/app-store"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { SpinnerIcon } from "@/components/icons"
import { imageToDataUrl } from "@/lib/media"
import { uploadAvatar } from "@/lib/supabase/avatar"
import { supabaseConfigured } from "@/lib/supabase/env"

const BIO_MAX = 160

export function EditProfileDialog() {
  const { user, updateProfile } = useAppStore()
  const [open, setOpen] = React.useState(false)
  const [displayName, setDisplayName] = React.useState("")
  const [bio, setBio] = React.useState("")
  // Photo: a newly picked file (with a local preview), or removed
  const [photo, setPhoto] = React.useState<{ file: File; preview: string } | null>(null)
  const [removePhoto, setRemovePhoto] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => () => void (photo && URL.revokeObjectURL(photo.preview)), [photo])

  // /profile?edit=1 (e.g. "Add your photo" in What's new) opens the dialog straight away
  const openedFromLink = React.useRef(false)
  React.useEffect(() => {
    if (openedFromLink.current || !user) return
    const url = new URL(window.location.href)
    if (url.searchParams.get("edit") !== "1") return
    openedFromLink.current = true
    url.searchParams.delete("edit")
    window.history.replaceState(null, "", url)
    onOpenChange(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when the account has loaded
  }, [user])

  function onOpenChange(next: boolean) {
    if (saving) return
    // Start from the saved values each time the dialog opens
    if (next && user) {
      setDisplayName(user.displayName ?? "")
      setBio(user.bio ?? "")
      setPhoto(null)
      setRemovePhoto(false)
    }
    setOpen(next)
  }

  function pickPhoto(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.")
      return
    }
    setPhoto({ file, preview: URL.createObjectURL(file) })
    setRemovePhoto(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const profile = { displayName: displayName.trim() || undefined, bio: bio.trim() || undefined }
    setSaving(true)
    try {
      if (photo) {
        // Square, small JPEG in your own Storage folder (demo mode keeps it in the browser)
        const avatarUrl = supabaseConfigured ? await uploadAvatar(photo.file) : await imageToDataUrl(photo.file, 400, 0.86)
        updateProfile({ ...profile, avatarUrl }, true)
      } else if (removePhoto) {
        updateProfile({ ...profile, avatarUrl: undefined }, true)
      } else {
        updateProfile(profile)
      }
      setOpen(false)
      toast.success("Profile updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save your profile. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const shownAvatar = photo?.preview ?? (removePhoto ? undefined : user?.avatarUrl)
  const name = displayName.trim() || user?.displayName || user?.username || "You"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="pill" variant="outline" className="w-full">
          <PencilIcon aria-hidden />
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={save} className="contents">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit profile</DialogTitle>
            <DialogDescription>This is what people see on your profile.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4">
            <CreatorAvatar creator={{ displayName: name, avatarUrl: shownAvatar }} className="size-20 text-xl" />
            <div className="flex flex-col items-start gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  pickPhoto(e.target.files?.[0])
                  e.target.value = ""
                }}
              />
              <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={() => fileRef.current?.click()} disabled={saving}>
                {shownAvatar ? "Change photo" : "Add photo"}
              </Button>
              {shownAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-muted-foreground"
                  onClick={() => {
                    setPhoto(null)
                    setRemovePhoto(true)
                  }}
                  disabled={saving}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="displayName">Display name</FieldLabel>
              <Input
                id="displayName"
                className="h-11"
                maxLength={40}
                placeholder={user?.username}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                rows={3}
                maxLength={BIO_MAX}
                placeholder="What do you make?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <FieldDescription className="text-right tabular-nums">
                {bio.length}/{BIO_MAX}
              </FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" size="pill" className="w-full" disabled={saving}>
              {saving && <SpinnerIcon aria-hidden className="animate-spin" />}
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
