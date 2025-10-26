import config from '../config.json';

export interface ConfigLanguage {
	code: string;
	name: string;
}

export interface Config {
	languages: ConfigLanguage[];
}

export default config as Config;
