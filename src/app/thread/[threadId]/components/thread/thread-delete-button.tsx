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
import { deleteThreadAction } from "@/lib/actions/thread";

import { DeleteIcon } from "@/components/icons/delete-icon";
import { useLocale } from '@/app/contexts/index';

interface ThreadDeleteButtonProps {
  threadId: string;
}

export const ThreadDeleteButton = ({ threadId }: ThreadDeleteButtonProps) => {
  const { locale } = useLocale();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteThreadAction(threadId);
      if (result.success) {
        toast.success("Thread deleted successfully!");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete the thread.");
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
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
            <><Spinner className="mr-2" />{locale("thread.deleting")}</>
          ) : (
            <><DeleteIcon className="mr-2" />{locale("thread.delete")}</>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{locale("thread.delete.alert.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {locale("thread.delete.alert.desc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{locale("thread.delete.alert.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{locale("thread.delete.alert.continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
