'use client';

import { useFormContext } from 'react-hook-form';
import { FormField } from '@/components/ui/form';
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { useLocale } from '@/app/contexts/index'

export const TitleField = () => {
  const { locale } = useLocale();
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <Field>
          <FieldLabel>{locale("title")}</FieldLabel>
          <Input placeholder={locale("thread.create.title")} {...field} />
          <FieldError />
        </Field>
      )}
    />
  );
};
