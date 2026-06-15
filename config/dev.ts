import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import baseConfig from "./index";

export default defineConfig(async (): Promise<UserConfigExport<"webpack5">> => {
  return {
    ...baseConfig,
    env: {
      NODE_ENV: '"development"',
      TARO_APP_API_BASE: JSON.stringify(process.env.TARO_APP_API_BASE || "http://127.0.0.1:8080"),
      TARO_APP_WEB_SHARE_BASE: JSON.stringify(process.env.TARO_APP_WEB_SHARE_BASE || "http://127.0.0.1:3000")
    }
  };
});
