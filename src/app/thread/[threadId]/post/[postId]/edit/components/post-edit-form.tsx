'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePostAction } from '@/lib/actions/post';
import { PostWithUserAndTagsAndReplies } from '@/types/post';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from '@/components/ui/form';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagsField } from '@/app/thread/create/components/fields/tags-field';
import { TagSuggestion } from '@/app/thread/create/components/fields/tag-suggestion';
import { useLocale } from '@/app/contexts/index';

const formSchema = z.object({
	content: z.string().min(1, {
		message: 'Content is required.',
	}),
	tags: z.string().optional(),
});

type Tag = {
	id: string;
	name: string;
};

type PostEditFormProps = {
	post: PostWithUserAndTagsAndReplies;
	allTags: Tag[];
};

export const PostEditForm = ({ post, allTags }: PostEditFormProps) => {
	const { locale } = useLocale();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: post.content,
			tags: post.tags.map((tag) => tag.name).join(','),
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsLoading(true);
		try {
			if (
				values.tags &&
				values.tags.charAt(values.tags.length - 1) === ','
			) {
				values.tags = values.tags.slice(0, -1);
			}

			const tagsArray = values.tags
				? values.tags
						.split(',')
						.map((tag) => tag.trim())
						.filter(
							(tag, index, self) =>
								self.indexOf(tag) === index && tag !== ''
						)
				: [];

			await updatePostAction(post.id, values.content, tagsArray);
			router.push(`/thread/${post.threadId}`);
			router.refresh();
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full liquid-glass-card">
			<CardHeader>
				<CardTitle>{locale("post.edit")}</CardTitle>
			</CardHeader>
			<CardContent>
				<FormProvider {...form}>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-8"
						>
							<Tabs defaultValue="edit" className="w-full">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="edit">
										{locale('post.edit.edit')}
									</TabsTrigger>
									<TabsTrigger value="preview">
										{locale('post.edit.preview')}
									</TabsTrigger>
								</TabsList>
								<TabsContent value="edit">
									<FormField
										control={form.control}
										name="content"
										render={({ field }) => (
											<Field>
												<FieldLabel>
													{locale(
														'post.edit.content'
													)}
												</FieldLabel>
												<Textarea
													placeholder={locale(
														'post.edit.content.desc'
													)}
													className="resize-none"
													rows={10}
													{...field}
												/>
												<FieldError />
											</Field>
										)}
									/>
								</TabsContent>
								<TagsField />
								<TagSuggestion allTags={allTags} />
								<TabsContent value="preview">
									<div className="prose dark:prose-invert">
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
										>
											{form.watch('content')}
										</ReactMarkdown>
									</div>
								</TabsContent>
							</Tabs>
							<div className="flex justify-end gap-2">
								<Button type="submit" disabled={isLoading}>
									{isLoading ? (
										<>
											<Spinner className="mr-2" />{' '}
											{locale('post.edit.submitting')}
										</>
									) : (
										locale('post.edit.submit')
									)}
								</Button>
								<Link href={`/thread/${post.threadId}`}>
									<Button type="button" variant="outline">
										{locale('post.edit.cancel')}
									</Button>
								</Link>
							</div>
						</form>
					</Form>
				</FormProvider>
			</CardContent>
		</Card>
	);
};
