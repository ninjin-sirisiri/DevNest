"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/app/contexts/index';

export const UserTabsList = () => {
	const { locale } = useLocale();
	return (
		<TabsList>
			<TabsTrigger value="threads">{locale('threads')}</TabsTrigger>
			<TabsTrigger value="posts">{locale('posts')}</TabsTrigger>
		</TabsList>
	);
};
