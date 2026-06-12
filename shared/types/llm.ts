/**
 * 内置 LLM 提供商列表
 */
export const LLM_PROVIDERS = [
  "deepseek",
  "siliconflow",
  "openai",
  "anthropic",
  "grok",
  "kimi",
  "minimax",
  "glm",
  "qwen",
  "gemini",
  "ollama",
] as const;

/** 内置 LLM 提供商类型的联合 */
export type BuiltinLLMProvider = typeof LLM_PROVIDERS[number];
/**
 * LLM 提供商类型（内置或自定义字符串）
 * 使用 `BuiltinLLMProvider | (string & {})` 模式支持字符串字面量推断和任意字符串
 */
export type LLMProvider = BuiltinLLMProvider | (string & {});

export function isBuiltinLLMProvider(provider: string): provider is BuiltinLLMProvider {
  return (LLM_PROVIDERS as readonly string[]).includes(provider);
}

/**
 * 模型配置
 */
export interface ModelConfig {
  /** LLM 提供商 */
  provider: LLMProvider;
  /** 模型名称 */
  model: string;
  /** 自定义 API 基础 URL */
  baseURL?: string;
  /** 温度参数 */
  temperature?: number;
  /** 最大输出 token 数 */
  maxTokens?: number;
}

/**
 * 提供商配置
 */
export interface ProviderConfig {
  /** 配置名称 */
  name: string;
  /** LLM 提供商 */
  provider: LLMProvider;
  /** API 基础 URL */
  baseURL: string;
  /** 默认模型 */
  defaultModel: string;
  /** 可用模型列表 */
  models: string[];
  /** 环境变量键名 */
  envKey: string;
}
