'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/app/contexts/index'

export const PostCreateTabList = ({}) => {
    const { locale } = useLocale();
    return (
		<TabsList className="grid w-full grid-cols-2">
			<TabsTrigger value="form">{locale("post.create.tab.form")}</TabsTrigger>
			<TabsTrigger value="context">{locale("post.create.tab.context")}</TabsTrigger>
		</TabsList>
	);
};
