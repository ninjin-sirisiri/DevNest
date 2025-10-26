import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAllTagsAction } from "@/lib/actions/tag";
import { fetchThreadByIdAction } from "@/lib/actions/thread";
import { ThreadEditForm } from "./components/thread-edit-form";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

const EditThreadPage = async ({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) => {
  const session = await auth();
  const threadResponse = await fetchThreadByIdAction((await params).threadId);

  if (!threadResponse.success) {
    console.error("Failed to fetch thread:", threadResponse.error);
    notFound();
  }
  const thread = threadResponse.data;

  if (session?.user?.id !== thread.user.id) {
    // Or redirect to an unauthorized page
    notFound();
  }

  const allTagsResponse = await fetchAllTagsAction();
  if (!allTagsResponse.success) {
    console.error("Failed to fetch tags:", allTagsResponse.error);
    // Decide how to handle this error, e.g., return an empty array or re-throw
    notFound(); // Or handle gracefully
  }
  const allTags = allTagsResponse.data;

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <ThreadEditForm allTags={allTags} thread={thread} />
    </div>
  );
};

export default EditThreadPage;
