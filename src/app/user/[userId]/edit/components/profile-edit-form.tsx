"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/lib/actions/profile";
import { User, Thread, Post } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from '@/app/contexts/index'

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bio: z.string().max(500, {
    message: "Bio must not exceed 500 characters.",
  }).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  user: User & {
    threads: Thread[];
    posts: Post[];
  };
}

export const ProfileEditForm = ({ user }: ProfileEditFormProps) => {
  const { locale } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);

    try {
      await updateProfileAction(user.id, data.name, data.bio || "");
      toast.success("Profile updated successfully!");
      router.push(`/user/${user.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{locale("profile.edit")}</CardTitle>
        <CardDescription>{locale("profile.edit.desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <Field>
                  <FieldLabel>{locale("profile.edit.username")}</FieldLabel>
                  <Input placeholder={locale("profile.edit.username.desc")} {...field} />
                  <FieldError />
                </Field>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <Field>
                  <FieldLabel>{locale("profile.edit.bio")}</FieldLabel>
                  <Textarea 
                    placeholder={locale("profile.edit.bio.desc")} 
                    className="min-h-[120px]"
                    {...field}
                  />
                  <FieldError />
                </Field>
              )}
            />
            <div className="flex justify-end gap-4">
              <ButtonGroup>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => router.push(`/user/${user.id}`)}
                  disabled={isSubmitting}
                >
                  {locale("profile.edit.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Spinner className="mr-2" />{locale("profile.edit.submitting")}</>
                  ) : (
                    locale("profile.edit.submit")
                  )}
                </Button>
              </ButtonGroup>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};