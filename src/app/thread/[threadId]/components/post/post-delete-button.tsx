"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { deletePostAction } from "@/lib/actions/post";

import { DeleteIcon } from "@/components/icons/delete-icon";
import { useLocale } from '@/app/contexts/index';

interface PostDeleteButtonProps {
  postId: string;
}

export const PostDeleteButton = ({ postId }: PostDeleteButtonProps) => {
  const { locale } = useLocale();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePostAction(postId);
      if (result.success) {
        toast.success("Post deleted successfully!");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete the post.");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          {isDeleting ? (
            <><Spinner className="mr-2" />{locale("post.deleting")}</>
          ) : (
            <><DeleteIcon className="mr-2" />{locale("post.delete")}</>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{locale("post.delete.alert")}</AlertDialogTitle>
          <AlertDialogDescription>{locale("post.delete.alert.desc")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{locale("post.delete.alert.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{locale("post.delete.alert.continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
