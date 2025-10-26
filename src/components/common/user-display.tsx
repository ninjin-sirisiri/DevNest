// src/components/common/user-display.tsx
// Reusable component to display user avatar, name, and creation timestamp.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "@/lib/utils";

import { useLocale } from '@/app/contexts/index';

interface UserDisplayProps {
  user: { name: string | null; image: string | null; isAnonymous?: boolean }; // Added isAnonymous
  createAt: Date;
}

export const UserDisplay = ({ user, createAt }: UserDisplayProps) => {
  const { locale } = useLocale();
  const displayName = user.isAnonymous ? locale("anonymous") : user.name;
  // If anonymous, set image to null so AvatarFallback is used
  const displayImage = user.isAnonymous ? null : user.image;

  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage src={displayImage ?? ""} alt={displayName ?? ""} />
        <AvatarFallback>{displayName?.charAt(0) ?? "A"}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="font-semibold text-foreground dark:text-foreground">
          {displayName}
        </p>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          {formatDistanceToNow(createAt)}
        </p>
      </div>
    </div>
  );
};
