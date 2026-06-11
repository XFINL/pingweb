import DetectionPanel from "@/components/DetectionPanel";

export default function PingV4Page() {
  return (
    <DetectionPanel
      title="Ping v4 检测"
      protocol="ICMP (IPv4)"
      placeholder="输入 IPv4 地址或域名"
    />
  );
}