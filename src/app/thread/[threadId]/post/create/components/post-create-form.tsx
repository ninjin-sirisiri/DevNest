'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as z from 'zod';
import { toast } from 'sonner';

import { TagSuggestion } from '@/app/thread/create/components/fields/tag-suggestion';
import { TagsField } from '@/app/thread/create/components/fields/tags-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Form, FormField } from '@/components/ui/form';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { createPostAction } from '@/lib/actions/post';
import { zodResolver } from '@hookform/resolvers/zod';

import { formSchema } from './schema';
import { useLocale } from '@/app/contexts/index';

type Tag = {
	id: string;
	name: string;
};

export const PostCreateForm = ({
	threadId,
	allTags,
}: {
	threadId: string;
	allTags: Tag[];
}) => {
	const [tab, setTab] = useState<'write' | 'preview'>('write');
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: '',
			tags: '',
		},
	});

	const { locale } = useLocale();
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			const tagsArray = values.tags
				.split(',')
				.map((tag) => tag.trim())
				.filter(
					(tag, index, self) =>
						self.indexOf(tag) === index && tag !== ''
				);

			const response = await createPostAction(
				values.content,
				threadId,
				tagsArray
			);

			if (response.success) {
				toast.success('Post created successfully!');
				router.push(`/thread/${threadId}`);
				router.refresh();
			} else {
				toast.error(response.message || 'Failed to create post.');
			}
		} catch (error) {
			console.error('Failed to create post:', error);
			toast.error('An unexpected error occurred. Please try again.');
		}
	};

	return (
		<Card className="w-full liquid-glass-card">
			<CardHeader>
				<CardTitle>{locale("post.create.header")}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-8">
					<FormProvider {...form}>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<div className="flex space-x-2 mb-4">
									<Button
										type="button"
										variant={
											tab === 'write'
												? 'secondary'
												: 'ghost'
										}
										onClick={() => setTab('write')}
									>
										{locale('post.create.write')}
									</Button>
									<Button
										type="button"
										variant={
											tab === 'preview'
												? 'secondary'
												: 'ghost'
										}
										onClick={() => setTab('preview')}
									>
										{locale('post.create.preview')}
									</Button>
								</div>
								<FormField
									control={form.control}
									name="content"
									render={({ field }) => (
										<Field>
											<FieldLabel>
												{locale('post.create.content')}
											</FieldLabel>
											{tab === 'write' ? (
												<Textarea
													placeholder={locale(
														'post.create.content.desc'
													)}
													{...field}
													rows={15}
												/>
											) : (
												<div className="prose dark:prose-invert min-h-[300px] border rounded-md p-4">
													<ReactMarkdown
														remarkPlugins={[
															remarkGfm,
														]}
													>
														{form.getValues(
															'content'
														)}
													</ReactMarkdown>
												</div>
											)}
											<FieldError />
										</Field>
									)}
								/>
								<TagsField />
								<TagSuggestion allTags={allTags} />
								<Button
									type="submit"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? (
										<>
											<Spinner className="mr-2" />{' '}
											{locale('post.create.submitting')}
										</>
									) : (
										locale('post.create.submit')
									)}
								</Button>
							</form>
						</Form>
					</FormProvider>
					<Button variant="secondary" onClick={() => router.back()}>
						{locale('post.create.cancel')}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
