"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ButtonGroup } from "@/components/ui/button-group";
import { Form } from "@/components/ui/form";
import { formSchema } from "@/app/thread/create/components/schema";
import { updateThreadAction } from "@/lib/actions/thread";
import { TitleField } from "@/app/thread/create/components/fields/title-field";
import { DescriptionField } from "@/app/thread/create/components/fields/description-field";
import { TagsField } from "@/app/thread/create/components/fields/tags-field";
import { TagSuggestion } from "@/app/thread/create/components/fields/tag-suggestion";
import { ThreadPageData } from "@/types/thread";
import { useLocale } from '@/app/contexts/index'

type Tag = {
  id: string;
  name: string;
};

interface ThreadEditFormProps {
  allTags: Tag[];
  thread: ThreadPageData;
}

export const ThreadEditForm = ({ allTags, thread }: ThreadEditFormProps) => {
  const { locale } = useLocale();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: thread.title,
      description: thread.description ?? "",
      tags: thread.tags.map((tag) => tag.name).join(","),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (values.tags.charAt(values.tags.length - 1) === ",") {
        values.tags = values.tags.slice(0, -1);
      }

      const tagsArray = values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag, index, self) => self.indexOf(tag) === index && tag !== "");

      const response = await updateThreadAction(
        thread.id,
        values.title,
        values.description,
        tagsArray
      );

      if (response.success) {
        toast.success("Thread updated successfully!");
        router.push(`/thread/${response.data.id}`);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to update thread.");
      }
    } catch (error) {
      console.error("Failed to update thread:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-2xl liquid-glass-card">
            <CardHeader>
              <CardTitle>{locale("thread.edit")}</CardTitle>
            </CardHeader>
            <CardContent>
                  <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <TitleField />
          <DescriptionField />
          <TagsField />
          <TagSuggestion allTags={allTags} />
          <ButtonGroup>
            <Button variant="edit" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <><Spinner className="mr-2" />{locale("thread.edit.submitting")}</>
              ) : (
                locale("thread.edit.submit")
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {locale("thread.edit.cancel")}
            </Button>
          </ButtonGroup>
        </form>
      </Form>
    </FormProvider>

            </CardContent>
          </Card>
  );
};
