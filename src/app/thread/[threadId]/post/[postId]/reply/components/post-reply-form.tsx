'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';
import { toast } from 'sonner';

import { formSchema } from '@/app/thread/[threadId]/post/create/components/schema';
import { TagSuggestion } from '@/app/thread/create/components/fields/tag-suggestion';
import { TagsField } from '@/app/thread/create/components/fields/tags-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from '@/components/ui/spinner';
import { Form, FormField } from '@/components/ui/form';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { createPostAction } from '@/lib/actions/post';
import { ThreadPageData } from '@/types/thread';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from '@/app/contexts/index';

type Post = ThreadPageData['posts'][0];

type Tag = {
	id: string;
	name: string;
};

export const PostReplyForm = ({
	post,
	allTags,
}: {
	post: Post; // Include tags in Post type
	allTags: Tag[];
}) => {
	const [tab, setTab] = useState<'write' | 'preview'>('write');
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: '',
			tags: '', // Populate tags
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
				post.threadId,
				tagsArray,
				post.id // Pass parentId
			);

			if (response.success) {
				toast.success('Reply posted successfully!');
				router.push(`/thread/${post.threadId}`);
				router.refresh();
			} else {
				toast.error(response.message || 'Failed to post reply.');
			}
		} catch (error) {
			console.error('Failed to post reply:', error);
			toast.error('An unexpected error occurred. Please try again.');
		}
	};

	return (
		<Card className="w-full liquid-glass-card">
			<CardHeader>
				<CardTitle>{locale("reply.title")}</CardTitle>
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
										{locale('reply.write')}
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
										{locale('reply.preview')}
									</Button>
								</div>
								<FormField
									control={form.control}
									name="content"
									render={({ field }) => (
										<Field>
											<FieldLabel>
												{locale('reply.content')}
											</FieldLabel>
											{tab === 'write' ? (
												<Textarea
													placeholder={locale(
														'reply.content.desc'
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
									variant="reply"
									type="submit"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? (
										<>
											<Spinner className="mr-2" />{' '}
											{locale('reply.submitting')}
										</>
									) : (
										locale('reply.submit')
									)}
								</Button>
							</form>
						</Form>
					</FormProvider>
					<Link href={`/thread/${post.threadId}`}>
						<Button variant="secondary">
							{locale('reply.cancel')}
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
};
