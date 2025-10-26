import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { PostCard } from "@/app/thread/[threadId]/components/post/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPostByIdAction } from "@/lib/actions/post";
import { fetchAllTagsAction } from "@/lib/actions/tag";
import { fetchThreadHeaderAction } from "@/lib/actions/thread";
import { auth } from "@/lib/auth";
import { formatDistanceToNow } from "@/lib/utils";

import { PostReplyForm } from "./components/post-reply-form";
import { PostReplyTabList } from "./components/post-reply-tab-list";

const ReplyPostPage = async ({
  params,
}: {
  params: Promise<{ threadId: string; postId: string }>;
}) => {
  const { threadId, postId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const [postResponse, threadResponse, allTagsResponse] = await Promise.all([
    fetchPostByIdAction(postId),
    fetchThreadHeaderAction(threadId),
    fetchAllTagsAction(),
  ]);

  if (!postResponse.success) {
    console.error("Failed to fetch post:", postResponse.error);
    notFound();
  }
  if (!postResponse.data) {
    console.error("Failed to fetch post: Data is null.");
    notFound();
  }
  const post = postResponse.data;

  if (!threadResponse.success) {
    console.error("Failed to fetch thread:", threadResponse.error);
    notFound();
  }
  if (!threadResponse.data) {
    console.error("Failed to fetch thread: Data is null.");
    notFound();
  }
  const thread = threadResponse.data;

  if (!allTagsResponse.success) {
    console.error("Failed to fetch tags:", allTagsResponse.error);
    notFound();
  }
  if (!allTagsResponse.data) {
    console.error("Failed to fetch tags: Data is null.");
    notFound();
  }
  const allTags = allTagsResponse.data;

  const displayName = thread.user.isAnonymous ? "anonymous" : thread.user.name;

  return (
    <div className="container mx-auto py-8 flex flex-col items-center gap-4">
      <Tabs defaultValue="form" className="w-full max-w-2xl">
        <PostReplyTabList />
        <TabsContent value="form">
          <PostReplyForm post={post} allTags={allTags} />
        </TabsContent>

        <TabsContent value="thread-context">
          <Card className="w-full liquid-glass-card">
            <CardHeader>
              <CardTitle>
                <Link
                  href={`/thread/${thread.id}`}
                  className="hover:underline text-primary"
                >
                  {thread.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert mt-2 max-w-none p-4">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {thread.description ?? ""}
                </Markdown>
              </div>
              <div className="flex items-center mt-4 space-x-4">
                {thread.user.isAnonymous ? (
                  <Avatar>
                    <AvatarImage src={undefined} alt={displayName ?? ""} />
                    <AvatarFallback>
                      {displayName?.charAt(0) ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Link href={`/user/${thread.user.id}`}>
                    <Avatar>
                      <AvatarImage
                        src={thread.user.image ?? ""}
                        alt={displayName ?? ""}
                      />
                      <AvatarFallback>
                        {displayName?.charAt(0) ?? "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )}
                <div>
                  {thread.user.isAnonymous ? (
                    <p className="font-semibold text-foreground dark:text-foreground">
                      {displayName}
                    </p>
                  ) : (
                    <Link href={`/user/${thread.user.id}`}>
                      <p className="font-semibold text-foreground dark:text-foreground hover:underline">
                        {displayName}
                      </p>
                    </Link>
                  )}
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {formatDistanceToNow(thread.createAt)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {thread.tags.map((tag: { id: string; name: string }) => (
                  <Link key={tag.id} href={`/tags/${tag.id}`}>
                    <Badge variant="secondary">{tag.name}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parent-post">
          <Card className="w-full liquid-glass-card">
            <CardHeader>
              <CardTitle>Parent Post</CardTitle>
            </CardHeader>
            <CardContent>
              <PostCard post={post} user={session?.user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReplyPostPage;
