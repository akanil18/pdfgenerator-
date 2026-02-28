import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    BarChart3,
    Users,
    Zap,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Activity,
    RefreshCcw,
    Share2,
    Image as ImageIcon,
    Layers,
    Scissors,
    FileText,
    FileSpreadsheet,
    MonitorPlay,
    Minimize2,
    Unlock,
} from "lucide-react";
import { getAnalytics } from "../services/api";

/* ── Tool icon mapping ── */
const TOOL_ICONS = {
    "image-to-pdf": ImageIcon,
    "merge-pdf": Layers,
    "split-pdf": Scissors,
    "pdf-to-word": FileText,
    "pdf-to-excel": FileSpreadsheet,
    "pdf-to-ppt": MonitorPlay,
    "compress-pdf": Minimize2,
    "unlock-pdf": Unlock,
};

const TOOL_COLORS = {
    "image-to-pdf": "from-red-500 to-rose-500",
    "merge-pdf": "from-orange-500 to-amber-500",
    "split-pdf": "from-rose-500 to-pink-500",
    "pdf-to-word": "from-blue-500 to-indigo-500",
    "pdf-to-excel": "from-emerald-500 to-green-500",
    "pdf-to-ppt": "from-amber-500 to-orange-500",
    "compress-pdf": "from-purple-500 to-violet-500",
    "unlock-pdf": "from-teal-500 to-cyan-500",
};

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, subValue, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative overflow-hidden p-5 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all"
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-2xl font-extrabold text-gray-900">{value ?? "—"}</p>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                    {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
                </div>
            </div>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${color} opacity-5 rounded-bl-full`} />
        </motion.div>
    );
}

/* ── Bar Chart (CSS-only) ── */
function MiniBarChart({ data, maxValue }) {
    if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-6">No data yet</p>;
    const max = maxValue || Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="flex items-end gap-1.5 h-32">
            {data.map((d, i) => (
                <motion.div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    style={{ transformOrigin: "bottom" }}
                >
                    <div
                        className="w-full rounded-t-md bg-gradient-to-t from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500 transition-colors cursor-pointer relative group"
                        style={{ height: `${Math.max((d.value / max) * 100, 4)}%`, minHeight: 4 }}
                    >
                        <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10">
                            {d.value} reqs
                        </div>
                    </div>
                    <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
                </motion.div>
            ))}
        </div>
    );
}

/* ── Tool Usage Row ── */
function ToolRow({ tool, index }) {
    const Icon = TOOL_ICONS[tool.tool] || BarChart3;
    const gradient = TOOL_COLORS[tool.tool] || "from-gray-500 to-gray-600";
    const successRate = tool.requests > 0
        ? Math.round((tool.success / tool.requests) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-red-100 shadow-sm hover:shadow-md transition-all"
        >
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 capitalize">{tool.tool.replace(/-/g, " ")}</p>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{tool.requests} requests</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{tool.users} users</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{tool.avg_ms}ms avg</span>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-sm font-bold ${successRate >= 90 ? "text-emerald-500" : successRate >= 70 ? "text-amber-500" : "text-red-500"}`}>
                    {successRate}%
                </span>
                <p className="text-[10px] text-gray-400">Success</p>
            </div>
            {/* Usage bar */}
            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${successRate}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                />
            </div>
        </motion.div>
    );
}

/* ── Recent Activity Row ── */
function RecentRow({ req, index }) {
    const isSuccess = req.status_code >= 200 && req.status_code < 300;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
        >
            {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-700 capitalize flex-1 truncate">
                {req.tool.replace(/-/g, " ")}
            </span>
            <span className="text-xs text-gray-400">{Math.round(req.processing_ms)}ms</span>
            <span className="text-xs text-gray-400 w-32 text-right truncate">
                {new Date(req.timestamp + "Z").toLocaleString()}
            </span>
        </motion.div>
    );
}


/* ══════════════════════════════════════════════════
   Main Analytics Dashboard
   ══════════════════════════════════════════════════ */
export default function AnalyticsPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAnalytics();
            setData(result);
        } catch (err) {
            setError("Could not fetch analytics. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleShare = () => {
        const text = data
            ? `📊 My PDF Toolkit Analytics:\n\n` +
            `📄 Total Requests: ${data.overview.total_requests}\n` +
            `👥 Unique Users: ${data.overview.unique_users}\n` +
            `⚡ Avg Processing: ${data.overview.avg_processing_ms}ms\n` +
            `✅ Success Rate: ${data.overview.total_requests > 0 ? Math.round((data.overview.success_count / data.overview.total_requests) * 100) : 0}%\n` +
            `🛠️ Tools Available: ${data.overview.tools_used}\n\n` +
            `#PDFToolkit #WebDev #SideProject`
            : "Check out my PDF Toolkit!";

        if (navigator.share) {
            navigator.share({ title: "PDF Toolkit Analytics", text });
        } else {
            navigator.clipboard.writeText(text);
            alert("📋 Analytics copied to clipboard! Paste it on LinkedIn.");
        }
    };

    /* ── Daily chart data ── */
    const dailyChartData = data?.daily?.slice(-14).map((d) => ({
        label: new Date(d.date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
        value: d.requests,
    })) || [];

    /* ── Hourly chart data ── */
    const hourlyChartData = data?.hourly?.map((h) => ({
        label: `${h.hour}h`,
        value: h.requests,
    })) || [];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-8">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05, x: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:border-red-300 hover:text-red-600 hover:shadow-md transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    All Tools
                </motion.button>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 transition-all"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(220,38,38,0.25)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-200"
                    >
                        <Share2 className="w-4 h-4" />
                        Share on LinkedIn
                    </motion.button>
                </div>
            </div>

            {/* ── Title ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl mb-5"
                >
                    <BarChart3 className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Usage Analytics
                </h1>
                <p className="mt-2 text-gray-500">Real-time insights into your PDF Toolkit usage</p>
            </motion.div>

            {/* ── Error ── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium text-center"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Loading ── */}
            {loading && !data && (
                <div className="text-center py-20">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 mx-auto rounded-full border-3 border-red-200 border-t-red-600"
                    />
                    <p className="mt-4 text-sm text-gray-400">Loading analytics…</p>
                </div>
            )}

            {/* ── Dashboard ── */}
            {data && (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={BarChart3}
                            label="Total Requests"
                            value={data.overview.total_requests?.toLocaleString()}
                            color="from-red-500 to-rose-500"
                            delay={0}
                        />
                        <StatCard
                            icon={Users}
                            label="Unique Users"
                            value={data.overview.unique_users?.toLocaleString()}
                            color="from-blue-500 to-indigo-500"
                            delay={0.1}
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Success Rate"
                            value={
                                data.overview.total_requests > 0
                                    ? `${Math.round((data.overview.success_count / data.overview.total_requests) * 100)}%`
                                    : "—"
                            }
                            color="from-emerald-500 to-green-500"
                            delay={0.2}
                        />
                        <StatCard
                            icon={Zap}
                            label="Avg Speed"
                            value={data.overview.avg_processing_ms ? `${data.overview.avg_processing_ms}ms` : "—"}
                            color="from-amber-500 to-orange-500"
                            delay={0.3}
                        />
                    </div>

                    {/* Today's Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-red-500" />
                            <h3 className="text-sm font-bold text-gray-800">Today</h3>
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <p className="text-2xl font-extrabold text-gray-900">{data.today?.requests || 0}</p>
                                <p className="text-xs text-gray-500">Requests</p>
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-gray-900">{data.today?.users || 0}</p>
                                <p className="text-xs text-gray-500">Users</p>
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-gray-900">{data.today?.success || 0}</p>
                                <p className="text-xs text-gray-500">Successful</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        {/* Daily Requests Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <TrendingUp className="w-5 h-5 text-red-500" />
                                <h3 className="text-sm font-bold text-gray-800">Daily Requests (Last 14 Days)</h3>
                            </div>
                            <MiniBarChart data={dailyChartData} />
                        </motion.div>

                        {/* Hourly Distribution Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <Clock className="w-5 h-5 text-red-500" />
                                <h3 className="text-sm font-bold text-gray-800">Hourly Distribution</h3>
                            </div>
                            <MiniBarChart data={hourlyChartData} />
                        </motion.div>
                    </div>

                    {/* Tool Usage */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-red-500" />
                            <h3 className="text-lg font-bold text-gray-800">Tool Usage Breakdown</h3>
                        </div>
                        <div className="space-y-3">
                            {data.tools?.map((tool, i) => (
                                <ToolRow key={tool.tool} tool={tool} index={i} />
                            ))}
                            {(!data.tools || data.tools.length === 0) && (
                                <p className="text-center text-sm text-gray-400 py-8">No tool usage data yet. Start using the tools!</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-red-500" />
                            <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
                            <span className="text-xs text-gray-400 ml-auto">Last 50 requests</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {data.recent?.map((req, i) => (
                                <RecentRow key={i} req={req} index={i} />
                            ))}
                            {(!data.recent || data.recent.length === 0) && (
                                <p className="text-center text-sm text-gray-400 py-8">No activity yet</p>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
