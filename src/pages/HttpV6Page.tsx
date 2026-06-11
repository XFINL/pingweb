import DetectionPanel from "@/components/DetectionPanel";

export default function HttpV6Page() {
  return (
    <DetectionPanel
      title="HTTP v6 检测"
      protocol="HTTP/1.1 (IPv6)"
      placeholder="输入 IPv6 地址或域名"
    />
  );
}