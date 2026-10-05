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

const BIO_MAX = 160

export function EditProfileDialog() {
  const { user, updateProfile } = useAppStore()
  const [open, setOpen] = React.useState(false)
  const [displayName, setDisplayName] = React.useState("")
  const [bio, setBio] = React.useState("")

  function onOpenChange(next: boolean) {
    // Start from the saved values each time the dialog opens
    if (next && user) {
      setDisplayName(user.displayName ?? "")
      setBio(user.bio ?? "")
    }
    setOpen(next)
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    updateProfile({ displayName: displayName.trim() || undefined, bio: bio.trim() || undefined })
    setOpen(false)
    toast.success("Profile updated")
  }

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
            <Button type="submit" size="pill" className="w-full">
              Save profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
