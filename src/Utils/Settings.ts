import { Portfolio } from "./Portfolio";

import { open } from "@tauri-apps/api/dialog";
import { documentDir, appDir, BaseDirectory } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile, createDir } from "@tauri-apps/api/fs";

export class Settings {
    portfolios: Portfolio[];
    dark_mode: boolean;

    constructor() {
        this.portfolios = [];
        this.dark_mode = true;
    }

    public async add_portfolio() {
        const selected = await open({
            directory: true,
            multiple: false,
            defaultPath: await documentDir(),
        });
        this.portfolios = [...this.portfolios, new Portfolio(selected.toString())];
    }

    public async safe_settings() {
        await createDir("config", {
            dir: BaseDirectory.App,
            recursive: true,
        });
        const settings_json = JSON.stringify(this);
        await writeTextFile({path: await appDir() + "config/settings.json", contents: settings_json});
    }

    public static async get_settings_from_config(): Promise<Settings> {
        let sett: Settings;
        await readTextFile("config/settings.json", { dir: BaseDirectory.App }).then(read => {
            sett = JSON.parse(read, (key, value) => {
                if (key === "portfolios") {
                    return value.map(p => Object.assign(new Portfolio(""), p));
                }
                return value;
            });
        }).catch(err => {
            console.log("Error reading settings file: " + err);
            sett = new Settings();
        });
        
        return Object.assign(new Settings, sett);
    }

}