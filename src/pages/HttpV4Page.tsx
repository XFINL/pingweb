import DetectionPanel from "@/components/DetectionPanel";

export default function HttpV4Page() {
  return (
    <DetectionPanel
      title="HTTP v4 检测"
      protocol="HTTP/1.1 (IPv4)"
      placeholder="输入 IPv4 地址或域名"
    />
  );
}