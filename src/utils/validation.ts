/**
 * 验证输入是否为合法的 IP 地址或域名
 */
export function isValidTarget(input: string): { valid: boolean; reason?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, reason: "请输入目标地址" };
  }

  // IPv4
  const ipv4Regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  if (ipv4Regex.test(trimmed)) {
    return { valid: true };
  }

  // IPv6 (简化校验)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}([0-9a-fA-F]{0,4})?$/;
  if (ipv6Regex.test(trimmed)) {
    return { valid: true };
  }

  // 域名
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  if (domainRegex.test(trimmed)) {
    return { valid: true };
  }

  // localhost
  if (trimmed === "localhost") {
    return { valid: true };
  }

  return { valid: false, reason: "请输入有效的 IP 地址或域名" };
}