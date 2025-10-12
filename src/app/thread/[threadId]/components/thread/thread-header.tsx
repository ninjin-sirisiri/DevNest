import { Session } from "next-auth";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThreadHeaderData } from "@/types/thread";
import { formatDistanceToNow } from "@/lib/utils";

import { EditIcon } from "@/components/icons/edit-icon";
import { ThreadDeleteButton } from "./thread-delete-button";

import { memo } from "react";

import { useLocale } from "@/app/contexts/index";

const ThreadHeaderComponent = ({
  thread,
  user,
}: {
  thread: ThreadHeaderData;
  user: Session["user"] | undefined;
}) => {
  const { locale } = useLocale();
  // Determine display name based on isAnonymous status
  const displayName = thread.user.isAnonymous ? "anonymous" : thread.user.name;
  // No need for displayImage, AvatarFallback will handle it

  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-foreground dark:text-foreground">
        {thread.title}
      </h1>
      <div className="prose dark:prose-invert mt-2 max-w-none p-4 liquid-glass-card liquid-glass-filter">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {thread.description ?? ""}
        </ReactMarkdown>
      </div>
      <div className="flex items-center mt-4 space-x-4">
        {/* Link to user profile, but only if not anonymous */}
        {thread.user.isAnonymous ? (
          <Avatar>
            <AvatarImage src={undefined} alt={displayName ?? ""} />
            <AvatarFallback>{displayName?.charAt(0) ?? "A"}</AvatarFallback>
          </Avatar>
        ) : (
          <Link href={`/user/${thread.user.id}`}>
            <Avatar>
              <AvatarImage
                src={thread.user.image ?? ""}
                alt={displayName ?? ""}
              />
              <AvatarFallback>{displayName?.charAt(0) ?? "A"}</AvatarFallback>
            </Avatar>
          </Link>
        )}
        <div>
          {thread.user.isAnonymous ? (
            <p className="font-semibold text-foreground dark:text-foreground">
              {displayName}
            </p>
          ) : (
            <Link
              href={`/user/${thread.user.id}`}
              className="font-semibold text-foreground dark:text-foreground hover:underline"
            >
              {displayName}
            </Link>
          )}
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            {formatDistanceToNow(thread.createAt)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {thread.tags.map((tag) => (
          <Badge key={tag.name} variant="secondary">
            {tag.name}
          </Badge>
        ))}
      </div>
      {user?.id === thread.user.id && (
        <div className="mt-3 flex gap-2">
          <Link href={`/thread/${thread.id}/edit`}>
            <Button variant="edit">
              <EditIcon className="mr-2 size-4" />
              {locale("thread.edit")}
            </Button>
          </Link>
          <ThreadDeleteButton threadId={thread.id} />
        </div>
      )}
    </header>
  );
};

export const ThreadHeader = memo(ThreadHeaderComponent);
