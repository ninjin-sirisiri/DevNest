import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUserByIdAction } from "@/lib/actions/user";
import { auth } from "@/lib/auth"; // New import
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditIcon } from "@/components/icons/edit-icon";

import { UserPostList } from "./user-post-list";
import { UserThreadList } from "./user-thread-list";
import { AnonymousToggle } from "./anonymous-toggle"; // New import

type Props = {
  userId: string;
};

export const UserProfile = async ({ userId }: Props) => {
  const session = await auth(); // Fetch session
  const response = await fetchUserByIdAction(userId);

  if (!response.success) {
    console.error("Failed to fetch user:", response.error);
    return <div>User not found</div>;
  }
  const user = response.data;

  const isCurrentUser = session?.user?.id === userId; // Check if current user

  return (
    <div className="space-y-4">
      <Card className="liquid-glass-card liquid-glass-filter">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
                {isCurrentUser && ( // Conditionally render toggle
                  <div className="mt-2">
                    <AnonymousToggle userId={user.id} initialIsAnonymous={user.isAnonymous} />
                  </div>
                )}
              </div>
            </div>
            {isCurrentUser && (
              <Button variant="edit" asChild>
                <Link href={`/user/${user.id}/edit`}>
                  <EditIcon className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        {user.bio && (
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{user.bio}</ReactMarkdown>
            </div>
          </CardContent>
        )}
      </Card>
      <Tabs defaultValue="threads">
        <TabsList>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="threads">
          <UserThreadList threads={user.threads} />
        </TabsContent>
        <TabsContent value="posts">
          <UserPostList posts={user.posts} />
        </TabsContent>
      </Tabs>
    </div>
  );
};