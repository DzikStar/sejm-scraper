export interface IPlugin {
    readonly name: string;
    readonly description: string;
    run(): Promise<unknown>;
}
