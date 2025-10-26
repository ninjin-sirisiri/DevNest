"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditIcon } from "@/components/icons/edit-icon";
import { useLocale } from '@/app/contexts/index'


export const EditProfileButton = ({ user }: { user: { id: string } }) => {
    const { locale } = useLocale();
    return (
		<Button variant="edit" asChild>
			<Link href={`/user/${user.id}/edit`}>
				<EditIcon className="size-4 sm:mr-2" />
				<span className="hidden sm:inline">{locale("profile.edit")}</span>
			</Link>
		</Button>
	);
};
