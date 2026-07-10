import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import baseConfig from "./index";

export default defineConfig(async (): Promise<UserConfigExport<"webpack5">> => {
  return {
    ...baseConfig,
    env: {
      NODE_ENV: '"production"',
      TARO_APP_API_BASE: JSON.stringify(process.env.TARO_APP_API_BASE || "https://zodiac.xiaodengge.top"),
      TARO_APP_WEB_SHARE_BASE: JSON.stringify(process.env.TARO_APP_WEB_SHARE_BASE || "https://zodiac.xiaodengge.top")
    },
    mini: {
      webpackChain(chain) {
        chain.merge({
          optimization: {
            minimize: true
          }
        });
      }
    }
  };
});
