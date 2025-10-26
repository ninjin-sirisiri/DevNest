import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchUserByIdAction } from "@/lib/actions/user";
import { ProfileEditTitle } from "./components/title";
import { ProfileEditForm } from "./components/profile-edit-form";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

const EditProfilePage = async ({ params }: Props) => {
  const session = await auth();
  const userId = (await params).userId;

  // Check if user is authenticated and if they're trying to edit their own profile
  if (!session?.user?.id || session.user.id !== userId) {
    redirect("/signin");
  }

  const response = await fetchUserByIdAction(userId);

  if (!response.success) {
    notFound();
  }

  const user = response.data;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <ProfileEditTitle />
      <ProfileEditForm user={user} />
    </div>
  );
};

export default EditProfilePage;