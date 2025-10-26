export const ID_LANGUAGE = 'en';

export function getLanguage() {
	return localStorage.getItem(ID_LANGUAGE) || 'en';
}

export function setLanguage(language: string | undefined) {
	if (language) localStorage.setItem(ID_LANGUAGE, language);
}
