'use client';

import { useLocale } from '@/app/contexts/index'

export const ProfileEditTitle = () => {
    const { locale } = useLocale();
	return <h1 className="text-3xl font-bold mb-6">{locale("profile.edit")}</h1>;
};
