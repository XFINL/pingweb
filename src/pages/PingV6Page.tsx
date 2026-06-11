import DetectionPanel from "@/components/DetectionPanel";

export default function PingV6Page() {
  return (
    <DetectionPanel
      title="Ping v6 检测"
      protocol="ICMP (IPv6)"
      placeholder="输入 IPv6 地址或域名"
      mode="ping"
      isV6={true}
    />
  );
}