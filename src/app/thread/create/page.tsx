import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAllTagsAction } from "@/lib/actions/tag";
import { ThreadCreateForm, ThreadCreateHeader } from "./components/thread-create-form";
import { auth } from "@/lib/auth"; // New import
import { redirect } from "next/navigation"; // New import

const CreateThreadPage = async () => {
  const session = await auth(); // Get session
  if (!session?.user?.id) {
    redirect("/api/auth/signin"); // Redirect to sign-in page if not authenticated
  }

  const allTagsResponse = await fetchAllTagsAction();
  if (!allTagsResponse.success) {
    console.error("Failed to fetch tags:", allTagsResponse.error);
    return null;
  }
  const allTags = allTagsResponse.data;

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <Card className="w-full max-w-2xl liquid-glass-card">
        <CardHeader>
          <ThreadCreateHeader />
        </CardHeader>
        <CardContent>
          <ThreadCreateForm allTags={allTags} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateThreadPage;