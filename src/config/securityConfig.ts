import type { SecurityConfig } from "../types/config";

/**
 * 页面加密（EncryptGate）配置
 *
 * 机制：构建时把页面敏感 HTML 用 PBKDF2 + AES-256-GCM 加密成密文内联进页面，
 * 浏览器输入密码派生密钥解密后注入 DOM（见 src/utils/encrypt-gate.ts 与
 * src/components/security/ 下的 EncryptGate.astro / PasswordGate.svelte）。
 *
 * 密码来自构建环境变量 GATE_PASSWORD（非 PUBLIC_ 前缀，绝不进入客户端代码）。
 * AES-GCM 的 auth tag 天然校验密码正确性，无需在客户端存任何密码哈希。
 * 密码丢失无法恢复（密文不可逆），请务必妥善保管。
 */
export const securityConfig: SecurityConfig = {
	enabled: false,
	pbkdf2Iterations: 250_000,
	rememberDays: 7,
	maxAttempts: 5,
	cooldownSeconds: 30,
	title: "私密空间",
	hint: "此内容已加密，输入访问密码后查看",
	emptyError: "请输入访问密码",
	wrongError: "密码不正确，请重试",
	cooldownError: "尝试次数过多，请稍后再试",
	unlockText: "解锁",
	unlockingText: "解锁中…",
	rememberText: "{days} 天内免输入",
};
