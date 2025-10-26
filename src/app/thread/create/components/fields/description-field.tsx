'use client';

import { useFormContext } from 'react-hook-form';
import { FormField } from '@/components/ui/form';
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocale } from '@/app/contexts/index'

export const DescriptionField = () => {
  const { locale } = useLocale()
  const { control, watch } = useFormContext();
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const description = watch('description');

  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <Field>
          <FieldLabel>{locale("description")}</FieldLabel>
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant={tab === 'write' ? 'secondary' : 'ghost'}
              onClick={() => setTab('write')}
            >
              {locale("thread.create.desc.write")}
            </Button>
            <Button
              type="button"
              variant={tab === 'preview' ? 'secondary' : 'ghost'}
              onClick={() => setTab('preview')}
            >
              {locale("thread.create.desc.preview")}
            </Button>
          </div>
          <div>
            {tab === 'write' ? (
              <Textarea
                placeholder={locale("thread.create.desc")}
                {...field}
              />
            ) : (
              <div className="prose dark:prose-invert p-3 min-h-[120px] rounded-md border border-input bg-background">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description || locale("thread.create.desc.preview.empty")}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <FieldError />
        </Field>
      )}
    />
  );
};
