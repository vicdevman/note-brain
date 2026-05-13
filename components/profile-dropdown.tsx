"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { ChevronDown, LogOut, User } from "lucide-react"

export function ProfileDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (!session) return null

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 p-2 h-auto hover:bg-[var(--nb-surface)]/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--nb-primary)] flex items-center justify-center">
            <User className="w-4 h-4 text-black" />
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-[var(--nb-text)]" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--nb-sidebar-bg)] border border-[var(--nb-border-strong)] rounded-md shadow-lg z-20">
            <div className="p-3 border-b border-[var(--nb-border-strong)]">
              <p className="text-sm font-medium text-[var(--nb-border)] truncate">
                {session.user?.name || session.user?.email}
              </p>
              <p className="text-xs text-[var(--nb-text-muted)] truncate">
                {session.user?.email}
              </p>
            </div>
            <div className="p-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 p-2 hover:bg-[var(--nb-surface)]/50"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 text-[var(--nb-text)]" />
                <span className="text-[var(--nb-text)]">Sign out</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
