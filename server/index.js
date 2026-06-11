import express from "express";
import cors from "cors";
import { execSync } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

// ─── 解析目标 IP ─────────────────────────────────────────
function resolveIp(target, v6) {
  // 已经是 IP 格式则直接返回
  if (/^\d+\.\d+\.\d+\.\d+$/.test(target)) return target;
  if (/^[0-9a-fA-F:]+$/.test(target)) return target;
  try {
    // v6 查 AAAA 记录，v4 查 A 记录
    const digCmd = v6
      ? `dig AAAA +short ${target} 2>/dev/null | head -1`
      : `dig +short ${target} 2>/dev/null | head -1`;
    const ip = execSync(digCmd, { timeout: 5000, encoding: "utf-8" }).trim();
    if (ip) {
      // 去掉末尾点号（dig 有时会返回带点的域名）
      const clean = ip.replace(/\.$/, "");
      // v6 地址含冒号，v4 地址含点号
      if (v6 && clean.includes(":")) return clean;
      if (!v6 && /^\d+\.\d+\.\d+\.\d+$/.test(clean)) return clean;
    }
    return "解析失败";
  } catch {
    return "解析失败";
  }
}

// ─── Ping API ─────────────────────────────────────────────
app.post("/api/ping", (req, res) => {
  const { target, v6 } = req.body;
  if (!target) return res.status(400).json({ error: "缺少 target" });

  const ip = resolveIp(target, v6);
  const pingFlag = v6 ? "-6" : "-4";

  try {
    const raw = execSync(`ping ${pingFlag} -c 5 -n ${target} 2>&1`, {
      timeout: 15000,
      encoding: "utf-8",
    });

    // 解析统计数据
    const statMatch = raw.match(
      /(\d+)\s+packets transmitted,\s+(\d+)\s+received,\s+(\d+)%?\s*packet loss/
    );
    // 解析 rtt
    const rttMatch = raw.match(
      /rtt\s+min\/avg\/max\/mdev\s*=\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)/
    );
    // 解析每个包的延迟
    const seqMatches = [...raw.matchAll(/icmp_seq=(\d+)\s+ttl=\d+\s+time=([\d.]+)\s*ms/g)];

    const sent = statMatch ? parseInt(statMatch[1]) : 5;
    const received = statMatch ? parseInt(statMatch[2]) : 0;
    const loss = statMatch ? parseInt(statMatch[3]) : 100;

    res.json({
      target,
      resolvedIp: ip,
      packetsSent: sent,
      packetsReceived: received,
      packetLoss: loss,
      minLatency: rttMatch ? parseFloat(rttMatch[1]) : 0,
      avgLatency: rttMatch ? parseFloat(rttMatch[2]) : 0,
      maxLatency: rttMatch ? parseFloat(rttMatch[3]) : 0,
      jitter: rttMatch ? parseFloat(rttMatch[4]) : 0,
      sequences: seqMatches.map((m) => ({
        seq: parseInt(m[1]),
        latency: parseFloat(m[2]),
      })),
    });
  } catch (e) {
    const stderr = e.stderr || "";
    const stdout = e.stdout || "";
    const combined = stdout + stderr;

    const statMatch = combined.match(
      /(\d+)\s+packets transmitted,\s+(\d+)\s+received,\s+(\d+)%?\s*packet loss/
    );
    const sent = statMatch ? parseInt(statMatch[1]) : 5;
    const received = statMatch ? parseInt(statMatch[2]) : 0;
    const loss = statMatch ? parseInt(statMatch[3]) : 100;

    res.json({
      target,
      resolvedIp: ip,
      packetsSent: sent,
      packetsReceived: received,
      packetLoss: loss,
      minLatency: 0,
      avgLatency: 0,
      maxLatency: 0,
      jitter: 0,
      sequences: [],
      error: loss >= 100 ? "目标无响应" : undefined,
    });
  }
});

// ─── HTTP API ─────────────────────────────────────────────
app.post("/api/http", async (req, res) => {
  const { target, v6 } = req.body;
  if (!target) return res.status(400).json({ error: "缺少 target" });

  const ip = resolveIp(target, v6);
  const curlFlag = v6 ? "-6" : "-4";

  try {
    const protocol = target.startsWith("http") ? "" : "https://";
    const url = `${protocol}${target}`;

    const curlCmd = `curl ${curlFlag} -o /dev/null -s -w 'dns:%{time_namelookup},tcp:%{time_connect},tls:%{time_appconnect},total:%{time_total},code:%{http_code},size:%{size_download},server:%{content_type}' -L --max-time 10 '${url}' 2>&1`;

    const raw = execSync(curlCmd, { timeout: 15000, encoding: "utf-8" }).trim();

    const parse = (key) => {
      const m = raw.match(new RegExp(`${key}:([^,]+)`));
      return m ? m[1] : "0";
    };

    const dns = parseFloat(parse("dns")) * 1000;
    const tcp = parseFloat(parse("tcp")) * 1000;
    const tls = parseFloat(parse("tls")) * 1000;
    const total = parseFloat(parse("total")) * 1000;
    const code = parseInt(parse("code"));
    const size = parseInt(parse("size"));
    const contentType = parse("server");

    res.json({
      target,
      resolvedIp: ip,
      statusCode: code || 0,
      responseTime: Math.round(total),
      contentSize: size,
      contentType,
      dnsLookup: Math.round(dns),
      tcpConnect: Math.round(tcp - dns),
      tlsHandshake: tls > 0 ? Math.round(tls - tcp) : 0,
      redirectCount: 0,
    });
  } catch (e) {
    const stderr = e.stderr || "";
    const stdout = e.stdout || "";
    const combined = stdout + stderr;

    const codeMatch = combined.match(/HTTP\/[\d.]+\s+(\d+)/);
    const httpCode = codeMatch ? parseInt(codeMatch[1]) : 0;

    res.json({
      target,
      resolvedIp: ip,
      statusCode: httpCode || 0,
      responseTime: 0,
      contentSize: 0,
      contentType: "",
      dnsLookup: 0,
      tcpConnect: 0,
      tlsHandshake: 0,
      redirectCount: 0,
      error: httpCode ? `HTTP ${httpCode}` : "无法连接到目标",
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[NetScope API] running on http://0.0.0.0:${PORT}`);
});