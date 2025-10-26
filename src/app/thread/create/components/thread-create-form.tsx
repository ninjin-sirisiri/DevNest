"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Form } from "@/components/ui/form";
import { formSchema } from "./schema";
import { createThreadAction } from "@/lib/actions/thread";
import { TitleField } from "./fields/title-field";
import { DescriptionField } from "./fields/description-field";
import { TagsField } from "./fields/tags-field";
import { TagSuggestion } from "./fields/tag-suggestion";
import { useLocale } from "@/app/contexts/index";
import { CardTitle } from "@/components/ui/card";

type Tag = {
  id: string;
  name: string;
};

interface ThreadCreateFormProps {
  allTags: Tag[];
}

export const ThreadCreateForm = ({ allTags }: ThreadCreateFormProps) => {
  const { locale } = useLocale();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (values.tags.charAt(values.tags.length - 1) == ",") {
        values.tags = values.tags.slice(0, -1);
      }

      const tagsArray = values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag, index, self) => self.indexOf(tag) === index && tag !== "");

      const response = await createThreadAction(
        values.title,
        values.description,
        tagsArray
      );

      if (response.success) {
        toast.success("Thread created successfully!");
        router.push(`/thread/${response.data.id}`);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to create thread.");
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <TitleField />
          <DescriptionField />
          <TagsField />
          <TagSuggestion allTags={allTags} />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <><Spinner className="mr-2" /> Creating...</>
            ) : (
              locale("thread.create.submit")
            )}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
};

export function ThreadCreateHeader() {
  const { locale } = useLocale();
  return <CardTitle>{locale("thread.create")}</CardTitle>;
}