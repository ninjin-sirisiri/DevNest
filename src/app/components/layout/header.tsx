'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Session } from 'next-auth';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import SignOut from '../auth/sign-out-form';
import { ThemeToggle } from '../theme/theme-trigger';
import { SearchBar } from './search-bar';

import config from '../../Config';
import { useLocale } from '@/app/contexts/index';

export const Header = ({ session }: { session: Session | null }) => {
	const { lang, locale, changeLocale } = useLocale();

	return (
		<div className="grid grid-cols-3 items-center bg-background/70 p-2 sticky top-0 z-10 border-b border-border/50 liquid-glass-filter">
			<div className="flex items-center">
				<Image
					src="/logo.png"
					alt="DevNest"
					width={60}
					height={60}
					priority
				/>
				<Link
					href="/"
					className="text-2xl font-bold text-foreground ml-2 hover:bg-accent/50 rounded-md p-2 transition-all duration-200"
				>
					DevNest
				</Link>
			</div>
			<div className="flex justify-center">
				<SearchBar />
			</div>
			<div className="flex items-center justify-end gap-4">
				<ThemeToggle />
				<div>
					<DropdownMenu>
						<DropdownMenuTrigger>Lang</DropdownMenuTrigger>
						<DropdownMenuContent>
							{config.languages.map(({ code, name }) => (
								<DropdownMenuItem
									key={code}
									onClick={() => changeLocale(code)}
									className={
										code === lang
											? 'font-bold text-primary'
											: ''
									}
								>
									{name}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<Suspense fallback={<Spinner />}>
					<div>
						{session?.user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Avatar>
										<AvatarImage
											src={session.user.image ?? ''}
											alt={session.user.name ?? ''}
											width={30}
											height={30}
										/>
										<AvatarFallback>
											{session.user.name?.charAt(0)}
										</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="liquid-glass-card liquid-glass-filter">
									<DropdownMenuLabel>
										{session.user.name ?? ''}
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{session.user.id && (
										<DropdownMenuItem asChild>
											<Link
												href={`/user/${session.user.id}`}
											>
												{locale('auth.profile')}
											</Link>
										</DropdownMenuItem>
									)}
									<DropdownMenuItem>
										<SignOut />
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Link href="/signin">
								<Button variant="outline">{locale("auth.sign_in")}</Button>
							</Link>
						)}
					</div>
				</Suspense>
			</div>
		</div>
	);
};
