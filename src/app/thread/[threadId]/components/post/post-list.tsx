import { PostWithUserAndTagsAndReplies, PostSortOrder } from "@/types/post";
import { fetchPostsForThreadAction } from "@/lib/actions/post";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState, useCallback } from "react";

import { PostCard } from "./post-card";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Session } from "next-auth";
import { useLocale } from '@/app/contexts/index'

export const PostList = ({
  threadId,
  user,
  sortOrder,
}: {
  threadId: string;
  user: Session["user"] | undefined;
  sortOrder: PostSortOrder;
}) => {
  const { locale } = useLocale();
  const [posts, setPosts] = useState<PostWithUserAndTagsAndReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  const fetchPosts = useCallback(async (take: number, cursor?: string) => {
    setLoading(true);
    const response = await fetchPostsForThreadAction(threadId, sortOrder, take, cursor);
    if (response.success) {
      setPosts((prevPosts) => {
        const newPosts = response.data.posts.filter(
          (newPost) => !prevPosts.some((prevPost) => prevPost.id === newPost.id)
        );
        return [...prevPosts, ...newPosts];
      });
      setHasMore(response.data.hasMore);
      setNextCursor(response.data.posts[response.data.posts.length - 1]?.id);
    } else {
      console.error("Failed to fetch posts:", response.error);
      setHasMore(false);
    }
    setLoading(false);
  }, [threadId, sortOrder]);

  useEffect(() => {
    setPosts([]);
    setNextCursor(undefined);
    setHasMore(true);
    fetchPosts(10);
  }, [threadId, sortOrder, fetchPosts]);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts(10, nextCursor);
        }
      },
      { threshold: 1.0 }
    );

    const observerTarget = document.getElementById("post-observer-target");
    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    };
  }, [hasMore, loading, nextCursor, fetchPosts]);

  if (posts.length === 0 && !loading) {
    return (
      <main>
        <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-foreground">
          Posts
        </h2>
        <Empty>
          <EmptyTitle>{locale("post.empty")}</EmptyTitle>
          <EmptyDescription>{locale("post.empty_desc")}</EmptyDescription>
        </Empty>
      </main>
    );
  }

  return (
    <main>
      <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-foreground">
        {locale("posts")}
      </h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} user={user} />
        ))}
        <div id="post-observer-target" className="h-1"></div>
        {loading && (posts.length > 0) && (
          <div className="flex justify-center items-center h-48">
            <Spinner className="h-12 w-12" />
          </div>
        )}
      </div>
    </main>
  );
};