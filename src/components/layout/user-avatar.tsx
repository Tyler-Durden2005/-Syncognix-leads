import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { AppUser } from "@/types"

export function UserAvatar({
  user,
  className,
  size,
}: {
  user: Pick<AppUser, "fullName" | "initials" | "avatarUrl">
  className?: string
  size?: "default" | "sm" | "lg"
}) {
  return (
    <Avatar size={size} className={cn("ring-1 ring-black/5 dark:ring-white/10", className)}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback className="bg-gradient-to-br from-primary/90 to-[oklch(0.42_0.17_290)] text-[11px] font-semibold text-primary-foreground">
        {user.initials}
      </AvatarFallback>
    </Avatar>
  )
}
