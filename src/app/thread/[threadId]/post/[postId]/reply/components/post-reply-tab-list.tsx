'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/app/contexts/index';

export const PostReplyTabList = () => {
	const { locale } = useLocale();
	return (
		<TabsList className="grid w-full grid-cols-3">
			<TabsTrigger value="form">{locale("reply.tab.form")}</TabsTrigger>
			<TabsTrigger value="thread-context">{locale("reply.tab.thread_context")}</TabsTrigger>
			<TabsTrigger value="parent-post">{locale("reply.tab.parent_post")}</TabsTrigger>
		</TabsList>
	);
};
