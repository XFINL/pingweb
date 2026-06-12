import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import HttpV4Page from "@/pages/HttpV4Page";
import HttpV6Page from "@/pages/HttpV6Page";
import PingV4Page from "@/pages/PingV4Page";
import PingV6Page from "@/pages/PingV6Page";
import DnsPage from "@/pages/DnsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/http-v4" element={<HttpV4Page />} />
        <Route path="/http-v6" element={<HttpV6Page />} />
        <Route path="/ping-v4" element={<PingV4Page />} />
        <Route path="/ping-v6" element={<PingV6Page />} />
        <Route path="/dns" element={<DnsPage />} />
      </Routes>
    </Router>
  );
}