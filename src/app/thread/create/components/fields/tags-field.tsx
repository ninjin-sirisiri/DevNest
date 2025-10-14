'use client';

import { useFormContext } from 'react-hook-form';
import { FormField } from '@/components/ui/form';
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { useLocale } from '@/app/contexts/index'

export const TagsField = () => {
  const { locale } = useLocale();
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <Field>
          <FieldLabel>{locale("thread.create.tags")}</FieldLabel>
          <Input placeholder="react, nextjs, typescript" {...field} />
          <FieldDescription>
            {locale("thread.create.tags.desc")}
          </FieldDescription>
          <FieldError />
        </Field>
      )}
    />
  );
};
