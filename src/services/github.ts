import { execSync } from 'node:child_process';
import { config } from '../core/config.js';
import logger from '../utils/logger.js';

export class Github {
    private PAT: string;

    constructor() {
        this.PAT = process.env.GH_PERSONAL_ACCESS_TOKEN ?? '';
    }

    clone(repo: string): void {
        logger.info(
            {
                Repository: repo,
                Author: config.git.author,
            },
            'Cloning GitHub repository',
        );

        try {
            execSync(`git clone --depth 1 https://github.com/${config.git.author}/${repo}.git`);
            logger.info({ repo }, 'Repository cloned successfully');
        } catch (error) {
            logger.error(
                {
                    repo,
                    err: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
                },
                'Failed to clone repository',
            );
            throw error;
        }
    }

    commit(message: string, path: string): void {
        logger.info({ path, message }, 'Preparing to commit changes');

        try {
            logger.debug({ path }, 'Setting git configuration');
            execSync(`git config user.name "${config.git.actions.username}"`, { cwd: path });
            execSync(`git config user.email "${config.git.actions.email}"`, { cwd: path });

            const maskedPAT = this.PAT ? `${this.PAT.substring(0, 4)}...${this.PAT.substring(this.PAT.length - 4)}` : 'not-provided';
            logger.debug({ path, token: maskedPAT }, 'Setting git remote URL with access token');
            execSync(`git remote set-url origin https://x-access-token:${this.PAT}@github.com/${config.git.author}/${config.git.repository.output}.git`, { cwd: path });

            // Check for changes
            const hasChanges = !!execSync('git status --porcelain', { cwd: path, encoding: 'utf-8' }).trim();

            if (!hasChanges) {
                logger.info({ path }, 'No changes detected, skipping commit');
                return;
            }

            // Commit and push changes
            logger.debug({ path }, 'Adding changes to git index');
            execSync('git add .', { cwd: path });

            logger.debug({ path, message }, 'Committing changes');
            try {
                execSync(`git commit -m "${message}"`, { cwd: path });
            } catch (commitError: unknown) {
                const errorWithStdout = commitError as { stdout?: string | Buffer };
                if (errorWithStdout.stdout?.toString().includes('nothing to commit')) {
                    logger.info({ path }, 'No changes to commit, skipping push (2 check)');
                    return;
                }
                throw commitError;
            }

            logger.info({ path }, 'Pushing changes to remote repository');
            execSync('git push origin main', { cwd: path });

            logger.info({ path, message }, 'Changes committed and pushed successfully');
        } catch (error) {
            logger.error(
                {
                    path,
                    message,
                    err: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
                },
                'Failed to commit and push changes',
            );
            throw error;
        }
    }
}
