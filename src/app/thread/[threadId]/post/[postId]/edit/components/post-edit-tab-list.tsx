'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/app/contexts/index';

export const PostEditTabList = () => {
    const { locale } = useLocale();
	return (
		<TabsList className="grid w-full grid-cols-2">
			<TabsTrigger value="form">{locale("post.edit.tab.edit")}</TabsTrigger>
			<TabsTrigger value="context">{locale("post.edit.tab.context")}</TabsTrigger>
		</TabsList>
	);
};
