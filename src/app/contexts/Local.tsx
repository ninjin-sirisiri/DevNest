'use client';

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	ReactNode,
} from 'react';
import config from '../Config';
import { getLanguage as getStoreLanguage, setLanguage as setStoreLanguage } from '../Store';
import English from '../../locales/en.json';

interface Locale {
	lang: string;
	locale: (key: string, ...params: string[]) => string;
	changeLocale: (lang: string) => unknown;
}
const Locale = createContext<Locale>({
	lang: 'none',
	locale: (key) => key,
	changeLocale: () => {},
});

export const Locales: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	en: English,
	fallback: English,
};

export function localize(lang: string, key: string, ...params: string[]) {
	const value: string | undefined =
		Locales[lang]?.[key] ??
		Locales.en?.[key] ??
		Locales.fallback[key] ??
		key;
	return resolveLocaleParams(value, params);
}

function resolveLocaleParams(value: string, params?: string[]): string {
	return value.replace(/%\d+%/g, (match) => {
		const index = parseInt(match.slice(1, -1));
		return params?.[index] !== undefined ? params[index] : match;
	});
}

async function loadLocale(language: string) {
	if (Locales[language]) return;
	const langConfig = config.languages.find((lang) => lang.code === language);
	if (!langConfig) return;
	try {
		const data = await import(`../../locales/${language}.json`);
		Locales[language] = data.default;
	} catch (error) {
		console.error(`Failed to load locale: ${language}`, error);
	}
}

export function useLocale() {
	return useContext(Locale);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [lang, setLanguage] = useState('en');

	const locale = useCallback(
		(key: string, ...params: string[]) => {
			return localize(lang, key, ...params);
		},
		[lang]
	);

	const changeLocale = useCallback(
		async (newLang: string) => {
			await loadLocale(newLang);
			setStoreLanguage(newLang);
			setLanguage(newLang);
		},
		[]
	);

	useEffect(() => {
		(async () => {
			const target = getStoreLanguage();
			await Promise.all([
				loadLocale('en'),
				...(target !== 'en' ? [loadLocale(target)] : []),
			]);
			setLanguage(target);
		})();
	}, []);

	const value: Locale = {
		lang,
		locale,
		changeLocale,
	};

	return <Locale.Provider value={value}>{children}</Locale.Provider>;
}
