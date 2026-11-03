import React, { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Printer,
  ExternalLink,
  Plus,
  Coffee,
  Wifi,
  Sparkles,
  Download,
  Copy,
  Check,
  Globe,
  Radio,
  Laptop,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import api from "../../services/api";

const LIVE_TUNNEL_URL = "https://auditor-transaction-webmaster-experienced.trycloudflare.com";
const WIFI_LAN_URL = "http://10.198.89.190:5173";

const QRCodes = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(1);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTableNum, setNewTableNum] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // QR URL Configuration States
  const currentBrowserOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  // Default to live tunnel if on localhost so phone scanning works right out of the box!
  const [hostMode, setHostMode] = useState(
    currentBrowserOrigin.includes("localhost") || currentBrowserOrigin.includes("127.0.0.1") ? "live" : "browser"
  );
  const [customHost, setCustomHost] = useState("");
  const [routeDestination, setRouteDestination] = useState("menu"); // "menu" | "home"
  const [paramType, setParamType] = useState("number"); // "number" | "token"

  const cardRef = useRef(null);

  const fetchTablesAndSettings = async () => {
    try {
      const [tableRes, setRes] = await Promise.all([api.getTables(), api.getSettings()]);
      if (tableRes.success) {
        setTables(tableRes.tables);
        if (tableRes.tables.length > 0) {
          setSelectedTable(tableRes.tables[0].tableNumber);
        }
      }
      if (setRes.success) {
        setSettings(setRes.settings);
      }
    } catch (err) {
      console.warn("[QRCodes] Load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTablesAndSettings();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNum) return;
    try {
      await api.createTable({ tableNumber: Number(newTableNum), capacity: 4 });
      setNewTableNum("");
      fetchTablesAndSettings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (table) => {
    try {
      const updatedStatus = !table.isActive;
      await api.updateTable(table._id, { isActive: updatedStatus });
      setTables(tables.map((t) => (t._id === table._id ? { ...t, isActive: updatedStatus } : t)));
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedTableObj = tables.find((t) => t.tableNumber === selectedTable);

  // Compute Base URL according to chosen mode
  const activeBaseUrl = (() => {
    if (hostMode === "live") return LIVE_TUNNEL_URL;
    if (hostMode === "wifi") return WIFI_LAN_URL;
    if (hostMode === "custom" && customHost) return customHost.replace(/\/$/, "");
    return currentBrowserOrigin;
  })();

  const pathPrefix = routeDestination === "menu" ? "/menu" : "";
  const qrParam = paramType === "token" && selectedTableObj?.qrToken ? selectedTableObj.qrToken : selectedTable;
  const qrUrl = `${activeBaseUrl}${pathPrefix}?table=${qrParam}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById("table-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `brewbuddies-table-${selectedTable}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleDownloadPNG = () => {
    const svg = document.getElementById("table-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      ctx.fillStyle = "#FFFDFC";
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 50, 50, 500, 500);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `brewbuddies-table-${selectedTable}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <OwnerHeader
        title="Table QR Code Generator"
        subtitle="Generate, customize, and print high-resolution QR codes for dine-in tables"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 bg-[#FFFDFC] hover:bg-[#FBF6EE] text-[#24160F] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#DCC9B3] shadow-xs transition-colors"
              title="Copy QR Code URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#C8752A]" />}
              <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
            </button>
            <button
              onClick={handleDownloadPNG}
              className="px-3.5 py-2.5 bg-[#FFFDFC] hover:bg-[#FBF6EE] text-[#24160F] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#DCC9B3] shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-[#C8752A]" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-[#C8752A] hover:bg-[#6B3515] text-[#FFFDFC] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-card transition-colors"
            >
              <Printer className="w-4 h-4 text-[#FFFDFC]" />
              <span>Print Table Card</span>
            </button>
          </div>
        }
      />

      {/* Mobile Scanning Guide Callout */}
      <div className="bg-[#FAF2E9] border border-[#E8D4C0] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#6E5545]">
        <div className="w-8 h-8 rounded-xl bg-[#C8752A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-bold text-[#24160F]">
            How to ensure your QR codes work on customer phones:
          </p>
          <p className="leading-relaxed">
            Smartphones cannot open <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[#964B00]">http://localhost:5173</code> because "localhost" on a phone refers to the phone itself.
            For live customer scanning, we automatically encode the <strong>Public Live Tunnel URL</strong> (<code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[#16A34A] break-all">{LIVE_TUNNEL_URL}</code>) or your <strong>Cafe Wi-Fi Network URL</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls & Configuration */}
        <div className="lg:col-span-5 space-y-4">
          {/* Table Selector */}
          <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-5 sm:p-6 shadow-card">
            <h3 className="text-xs font-bold text-[#24160F] uppercase tracking-wider mb-3">
              1. Select Dine-in Table
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {tables.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTable(t.tableNumber)}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center border ${
                    selectedTable === t.tableNumber
                      ? "bg-[#C8752A] text-white border-[#C8752A] shadow-caramel-glow scale-105"
                      : "bg-[#FBF6EE] text-[#765F4D] border-[#DCC9B3] hover:bg-[#EFE0CB]"
                  }`}
                >
                  <span className={`text-[9px] font-normal uppercase ${selectedTable === t.tableNumber ? "text-white/80" : "text-[#765F4D]"}`}>
                    Tbl
                  </span>
                  <span>#{t.tableNumber}</span>
                </button>
              ))}
            </div>

            {selectedTableObj && (
              <div className="mt-4 p-3.5 bg-[#FBF6EE] rounded-2xl border border-[#DCC9B3] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-serif font-bold text-[#24160F]">Table #{selectedTableObj.tableNumber}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedTableObj.isActive ? "bg-[#4F8061]/15 text-[#4F8061] border-[#4F8061]/30" : "bg-[#B8543E]/15 text-[#B8543E] border-[#B8543E]/30"
                    }`}>
                      {selectedTableObj.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#765F4D] mt-0.5">
                    {selectedTableObj.isActive ? "Accepting dine-in orders" : "Ordering disabled for table"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedTableObj)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                    selectedTableObj.isActive
                      ? "bg-[#FFFDFC] text-[#765F4D] border-[#DCC9B3] hover:bg-[#F5EBDD]"
                      : "bg-[#3B1F0F] text-[#FFFDFC] border-[#3B1F0F] hover:bg-[#24130A]"
                  }`}
                >
                  {selectedTableObj.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            )}

            {/* Add Table form */}
            <form onSubmit={handleAddTable} className="mt-5 pt-4 border-t border-[#DCC9B3]/40 flex gap-2">
              <input
                type="number"
                min="1"
                max="99"
                placeholder="Table #"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="w-24 text-xs px-3 py-2 bg-[#FBF6EE] border border-[#DCC9B3] rounded-xl text-[#24160F] focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
              />
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-[#3B1F0F] hover:bg-[#24130A] text-[#FFFDFC] text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#E5A04B]" />
                <span>Add Table</span>
              </button>
            </form>
          </div>

          {/* QR Code Target & Domain Configuration */}
          <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-5 sm:p-6 shadow-card text-xs space-y-4">
            <h3 className="font-bold text-[#24160F] uppercase tracking-wider">
              2. QR URL & Network Options
            </h3>

            {/* Destination Selection */}
            <div>
              <label className="block font-semibold text-[#5A4031] mb-1.5">
                Scan Destination:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRouteDestination("menu")}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all text-left ${
                    routeDestination === "menu"
                      ? "bg-[#C8752A] text-white border-[#C8752A] shadow-xs"
                      : "bg-[#FBF6EE] text-[#765F4D] border-[#DCC9B3] hover:bg-[#EFE0CB]"
                  }`}
                >
                  <span>Direct Menu (/menu)</span>
                  <span className={`block text-[10px] font-normal ${routeDestination === "menu" ? "text-white/80" : "text-[#9C8472]"}`}>
                    Recommended for ordering
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRouteDestination("home")}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all text-left ${
                    routeDestination === "home"
                      ? "bg-[#C8752A] text-white border-[#C8752A] shadow-xs"
                      : "bg-[#FBF6EE] text-[#765F4D] border-[#DCC9B3] hover:bg-[#EFE0CB]"
                  }`}
                >
                  <span>Cafe Home (/)</span>
                  <span className={`block text-[10px] font-normal ${routeDestination === "home" ? "text-white/80" : "text-[#9C8472]"}`}>
                    Shows welcome & offers
                  </span>
                </button>
              </div>
            </div>

            {/* Base Domain Host Mode */}
            <div>
              <label className="block font-semibold text-[#5A4031] mb-1.5">
                QR Domain / Host:
              </label>
              <div className="space-y-1.5">
                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  hostMode === "live" ? "bg-[#FAF2E9] border-[#C8752A]" : "bg-[#FBF6EE] border-[#DCC9B3] hover:bg-[#FAF4EC]"
                }`}>
                  <input
                    type="radio"
                    name="hostMode"
                    value="live"
                    checked={hostMode === "live"}
                    onChange={() => setHostMode("live")}
                    className="mt-0.5 text-[#C8752A] focus:ring-[#C8752A]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#24160F]">
                      <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Live Public Tunnel (Best for Mobile)</span>
                      <span className="text-[9px] bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0] px-1.5 py-0.2 rounded-full font-bold">
                        Works Anywhere
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6E5545] break-all block mt-0.5">
                      {LIVE_TUNNEL_URL}
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  hostMode === "wifi" ? "bg-[#FAF2E9] border-[#C8752A]" : "bg-[#FBF6EE] border-[#DCC9B3] hover:bg-[#FAF4EC]"
                }`}>
                  <input
                    type="radio"
                    name="hostMode"
                    value="wifi"
                    checked={hostMode === "wifi"}
                    onChange={() => setHostMode("wifi")}
                    className="mt-0.5 text-[#C8752A] focus:ring-[#C8752A]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#24160F]">
                      <Radio className="w-3.5 h-3.5 text-[#C8752A]" />
                      <span>Cafe Wi-Fi Network IP</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6E5545] break-all block mt-0.5">
                      {WIFI_LAN_URL}
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  hostMode === "browser" ? "bg-[#FAF2E9] border-[#C8752A]" : "bg-[#FBF6EE] border-[#DCC9B3] hover:bg-[#FAF4EC]"
                }`}>
                  <input
                    type="radio"
                    name="hostMode"
                    value="browser"
                    checked={hostMode === "browser"}
                    onChange={() => setHostMode("browser")}
                    className="mt-0.5 text-[#C8752A] focus:ring-[#C8752A]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#24160F]">
                      <Laptop className="w-3.5 h-3.5 text-[#765F4D]" />
                      <span>Current Browser Origin</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6E5545] break-all block mt-0.5">
                      {currentBrowserOrigin}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Direct Link Preview & Test Actions */}
            <div className="pt-2 border-t border-[#DCC9B3]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#24160F]">Encoded QR URL:</span>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  {hostMode === "live" ? "Phone Scannable" : hostMode === "wifi" ? "Wi-Fi Scannable" : "Local Browser"}
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#24160F] break-all bg-[#FBF6EE] p-2.5 rounded-xl border border-[#DCC9B3]">
                {qrUrl}
              </p>
              <div className="flex items-center justify-between pt-1">
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#C8752A] hover:text-[#6B3515] font-bold hover:underline"
                >
                  <span>Test in new tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-xs font-semibold text-[#765F4D] hover:text-[#24160F] flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Printable Table Card Preview */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            ref={cardRef}
            className="w-full max-w-sm bg-[#FFFDFC] rounded-3xl border-2 border-[#DCC9B3] shadow-card-lg p-6 sm:p-7 text-center space-y-4 print:border-none print:shadow-none print:m-0"
          >
            {/* Header */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B1F0F] to-[#24130A] text-[#E5A04B] flex items-center justify-center shadow-md mb-2.5 border border-[#6B3515]">
                <Coffee className="w-7 h-7 text-[#E5A04B]" />
              </div>
              <h2 className="text-xl font-bold font-serif text-[#24160F] leading-tight">
                {settings?.cafeName || "BrewBuddies Cafe"}
              </h2>
              <p className="text-[11px] text-[#C8752A] uppercase tracking-widest font-semibold mt-0.5">
                {settings?.tagline || "Artisan Coffee & Cozy Moments"}
              </p>
            </div>

            {/* Table Number Badge */}
            <div className="inline-block bg-[#EFE0CB] text-[#3B1F0F] border border-[#DCC9B3] px-5 py-1.5 rounded-full shadow-xs">
              <span className="text-sm font-extrabold font-serif tracking-tight">
                TABLE #{selectedTable}
              </span>
            </div>

            {/* QR Code */}
            <div className="bg-[#FFFDFC] p-4 rounded-3xl border border-[#DCC9B3] inline-block mx-auto shadow-inner">
              <QRCodeSVG
                id="table-qr-svg"
                value={qrUrl}
                size={190}
                level="H"
                includeMargin={true}
                bgColor={"#FFFDFC"}
                fgColor={"#24130A"}
              />
            </div>

            {/* Instructions */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#24160F] uppercase tracking-wide">
                Scan to View Menu & Order
              </h4>
              <p className="text-[11px] text-[#765F4D] leading-relaxed max-w-xs mx-auto">
                Point your phone camera at the code to browse our handcrafted drinks, place your order, and earn loyalty points.
              </p>
            </div>

            {/* Wi-Fi Info */}
            <div className="bg-[#FBF6EE] border border-[#DCC9B3] rounded-2xl p-3 text-[11px] text-[#765F4D] flex items-center justify-around">
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-[#C8752A]" />
                <span className="font-semibold text-[#24160F]">{settings?.wifiSsid || "BrewBuddies_Guest_WiFi"}</span>
              </div>
              <span className="text-[#DCC9B3]">|</span>
              <div>
                <span className="text-[#765F4D]">Pass: </span>
                <span className="font-mono font-bold text-[#24160F]">
                  {settings?.wifiPassword || "Coffee2026"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodes;
