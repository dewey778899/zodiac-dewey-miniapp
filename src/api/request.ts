import Taro from "@tarojs/taro";
import { API_BASE } from "../utils/constants";

interface ApiErrorShape {
  error?: string;
  message?: string;
}

function explainRequestFailure(error: unknown) {
  if (!(error instanceof Error)) {
    return "请求失败，请稍后再试";
  }

  const text = error.message || "";
  const normalized = text.toLowerCase();

  if (normalized.includes("fail url not in domain list")) {
    return "当前域名还没加入小程序合法请求域名，真机无法访问后端";
  }

  if (API_BASE.startsWith("http://") && normalized.includes("request:fail")) {
    return "当前接口还是 HTTP，小程序真机通常不会放行，请尽快切到 HTTPS";
  }

  if (normalized.includes("ssl") || normalized.includes("certificate")) {
    return "后端证书异常，小程序真机不会放行请求";
  }

  if (normalized.includes("timeout")) {
    return "请求超时，请检查后端服务是否可用";
  }

  if (normalized.includes("refused") || normalized.includes("failed to connect")) {
    return "后端服务未启动，或域名没有正确转发到服务";
  }

  if (normalized.includes("request:fail")) {
    return "小程序真机请求被拦截，通常是域名未配置、仍在使用 HTTP，或证书异常";
  }

  return error.message;
}

export async function request<T>(path: string, options: Partial<Taro.request.Option> = {}) {
  try {
    const response = await Taro.request<ApiErrorShape & T>({
      url: `${API_BASE}${path}`,
      method: options.method || "GET",
      data: options.data,
      header: {
        "Content-Type": "application/json",
        ...(options.header || {})
      }
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data as T;
    }

    const data = response.data || {};
    throw new Error(data.message || data.error || `请求失败（${response.statusCode}）`);
  } catch (error) {
    throw new Error(explainRequestFailure(error));
  }
}
