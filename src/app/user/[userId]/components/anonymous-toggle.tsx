// src/app/user/[userId]/components/anonymous-toggle.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { updateUserAnonymousStatusAction } from "@/lib/actions/user";
import { useLocale } from '@/app/contexts/index'

interface AnonymousToggleProps {
  userId: string;
  initialIsAnonymous: boolean;
}

export const AnonymousToggle = ({ userId, initialIsAnonymous }: AnonymousToggleProps) => {
  const { locale } = useLocale();
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsAnonymous(checked); // Optimistic update

    startTransition(async () => {
      try {
        const response = await updateUserAnonymousStatusAction(userId, checked);
        if (response.success) {
          toast.success("Anonymous status updated successfully!");
        } else {
          toast.error(response.message || "Failed to update anonymous status.");
          setIsAnonymous(initialIsAnonymous); // Revert on error
        }
      } catch (error) {
        console.error("Failed to update anonymous status:", error);
        toast.error("An unexpected error occurred. Please try again.");
        setIsAnonymous(initialIsAnonymous); // Revert on error
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="anonymous-mode"
        checked={isAnonymous}
        onChange={handleToggle}
        disabled={isPending}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" // Basic styling
      />
      <label htmlFor="anonymous-mode" className="text-sm font-medium text-gray-700">
        {isAnonymous ? locale("anonymous.mode_on") : locale("anonymous.mode_off")}
      </label>
      {isPending && <Spinner className="ml-2" />}
    </div>
  );
};