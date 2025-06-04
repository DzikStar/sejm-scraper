import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface IActions {
    username: string;
    email: string;
}

export interface IRepository {
    scraper: string;
    output: string;
}

export interface IGitConfig {
    author: string;
    repository: IRepository;
    actions: IActions;
}

export interface IConfig {
    deploy_on_github: boolean;
    git: IGitConfig;
}

class ConfigManager {
    private static instance: ConfigManager;
    public readonly config: IConfig;

    private constructor() {
        this.config = JSON.parse(readFileSync(join(process.cwd(), 'sejm-scraper.config.json'), 'utf8'));
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    public getConfig(): IConfig {
        return this.config;
    }
}

export const config: IConfig = ConfigManager.getInstance().getConfig();
