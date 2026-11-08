var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
// =========================================================================
// STORAGE & SESSION HELPERS
// =========================================================================
var AppStorage = {
    getUser: function () {
        try {
            var u = localStorage.getItem("inkloom_user");
            return u ? JSON.parse(u) : null;
        }
        catch (_a) {
            return null;
        }
    },
    setUser: function (user) {
        localStorage.setItem("inkloom_user", JSON.stringify(user));
        localStorage.setItem("inkloom_role", user.role);
    },
    clear: function () {
        localStorage.removeItem("inkloom_user");
        localStorage.removeItem("inkloom_role");
    }
};
// =========================================================================
// MAIN REACT APP COMPONENT
// =========================================================================
function App() {
    var _a = useState(function () { return AppStorage.getUser(); }), currentUser = _a[0], setCurrentUser = _a[1];
    var _b = useState(function () {
        var u = AppStorage.getUser();
        if (!u)
            return "auth";
        if (u.role === "creator")
            return "creator";
        if (u.role === "brand-manager")
            return "brand-manager";
        return "admin";
    }), activeView = _b[0], setActiveView = _b[1];
    var _c = useState(null), toast = _c[0], setToast = _c[1];
    // Re-render Lucide icons on view change
    useEffect(function () {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [activeView, currentUser]);
    var showToast = function (message, type) {
        if (type === void 0) { type = "success"; }
        setToast({ message: message, type: type });
        setTimeout(function () { return setToast(null); }, 3500);
    };
    var handleLoginSuccess = function (user) {
        AppStorage.setUser(user);
        setCurrentUser(user);
        if (user.role === "creator")
            setActiveView("creator");
        else if (user.role === "brand-manager")
            setActiveView("brand-manager");
        else
            setActiveView("admin");
        showToast("Signed in as " + user.name + " (" + user.role + ")");
    };
    var handleLogout = function () {
        AppStorage.clear();
        setCurrentUser(null);
        setActiveView("auth");
        showToast("Signed out successfully.");
    };
    // Strict RBAC Guard: If non-admin tries to open admin or database view
    var handleNavigate = function (view) {
        if (!currentUser && view !== "auth") {
            setActiveView("auth");
            return;
        }
        if (view === "database" || view === "admin") {
            if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== "admin") {
                alert("Access Denied: Your role (" + (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) + ") does not have permission to access the Database Studio or Admin Console.");
                return;
            }
        }
        if (view === "brand-manager" && (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== "brand-manager" && (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== "admin") {
            alert("Access Denied: Brand Manager portal is restricted.");
            return;
        }
        setActiveView(view);
    };
    return (React.createElement("div", { class: "min-h-screen flex flex-col" },
        toast && (React.createElement("div", { class: "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-semibold bg-slate-900 text-white border-slate-800 animate-bounce" },
            React.createElement("span", { class: toast.type === "error" ? "text-red-400" : "text-emerald-400" }, toast.type === "error" ? "✕" : "✓"),
            React.createElement("span", null, toast.message))),
        currentUser && activeView !== "auth" && (React.createElement(Navbar, { user: currentUser, activeView: activeView, onNavigate: handleNavigate, onLogout: handleLogout })),
        React.createElement("div", { class: "flex-1 flex max-w-7xl w-full mx-auto" },
            currentUser && activeView !== "auth" && (React.createElement(Sidebar, { user: currentUser, activeView: activeView, onNavigate: handleNavigate })),
            React.createElement("main", { class: "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" },
                activeView === "auth" && (React.createElement(AuthView, { onLoginSuccess: handleLoginSuccess, showToast: showToast })),
                activeView === "creator" && (React.createElement(CreatorStudio, { user: currentUser, showToast: showToast, onNavigate: handleNavigate })),
                activeView === "brand-manager" && (React.createElement(BrandManagerPortal, { user: currentUser, showToast: showToast, onNavigate: handleNavigate })),
                activeView === "admin" && (React.createElement(AdminSuite, { user: currentUser, showToast: showToast, onNavigate: handleNavigate })),
                activeView === "database" && (React.createElement(DatabaseStudio, { user: currentUser, showToast: showToast })),
                activeView === "drafts" && (React.createElement(DraftsView, { user: currentUser, onNavigate: handleNavigate })),
                activeView === "rulebook" && (React.createElement(RulebookView, { user: currentUser, showToast: showToast }))))));
}
// =========================================================================
// NAVBAR COMPONENT (Database Studio button ONLY for Admin!)
// =========================================================================
function Navbar(_a) {
    var user = _a.user, activeView = _a.activeView, onNavigate = _a.onNavigate, onLogout = _a.onLogout;
    var role = (user === null || user === void 0 ? void 0 : user.role) || "creator";
    var initials = ((user === null || user === void 0 ? void 0 : user.name) || "User").split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    var roleBadges = {
        creator: { label: "Author Studio", cls: "bg-blue-50 text-blue-800 border-blue-200" },
        "brand-manager": { label: "Brand Manager", cls: "bg-purple-50 text-purple-800 border-purple-200" },
        admin: { label: "Security & Admin", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    }[role] || { label: "Workspace", cls: "bg-slate-100 text-slate-800 border-slate-200" };
    return (React.createElement("header", { class: "sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs" },
        React.createElement("div", { class: "flex h-14 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto" },
            React.createElement("div", { class: "flex items-center gap-2.5 cursor-pointer", onClick: function () { return onNavigate(role); } },
                React.createElement("div", { class: "flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm" },
                    React.createElement("i", { "data-lucide": "shield-check", class: "w-4 h-4" })),
                React.createElement("div", { class: "flex items-center gap-1.5" },
                    React.createElement("span", { class: "font-bold text-sm tracking-tight text-slate-900" }, "Inkloom AI"),
                    React.createElement("span", { class: "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200" }, "React Core"))),
            React.createElement("div", { class: "flex items-center gap-3" },
                role === "admin" && (React.createElement("button", { onClick: function () { return onNavigate("database"); }, class: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ".concat(activeView === "database"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100") },
                    React.createElement("i", { "data-lucide": "database", class: "w-3.5 h-3.5" }),
                    React.createElement("span", null, "Database Studio"),
                    React.createElement("span", { class: "h-2 w-2 rounded-full bg-emerald-400 animate-pulse" }))),
                React.createElement("div", { class: "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ".concat(roleBadges.cls) },
                    React.createElement("span", { class: "h-2 w-2 rounded-full bg-emerald-500" }),
                    React.createElement("span", null, roleBadges.label)),
                React.createElement("div", { class: "flex items-center gap-2.5 pl-2 border-l border-slate-200" },
                    React.createElement("div", { class: "h-8 w-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs" }, initials),
                    React.createElement("div", { class: "hidden md:block text-right" },
                        React.createElement("div", { class: "text-xs font-bold text-slate-900" }, user.name),
                        React.createElement("div", { class: "text-[10px] text-slate-500" }, user.department || user.email)),
                    React.createElement("button", { onClick: onLogout, title: "Sign Out", class: "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors" },
                        React.createElement("i", { "data-lucide": "log-out", class: "w-4 h-4" })))))));
}
// =========================================================================
// SIDEBAR COMPONENT (Strict RBAC Navigation)
// =========================================================================
function Sidebar(_a) {
    var user = _a.user, activeView = _a.activeView, onNavigate = _a.onNavigate;
    var role = (user === null || user === void 0 ? void 0 : user.role) || "creator";
    var navItems = [];
    var workspaceTitle = "Author Studio";
    if (role === "creator") {
        workspaceTitle = "Author Studio";
        navItems = [
            { name: "Compliance Inspector", id: "creator", icon: "check-square" },
            { name: "Active Drafts", id: "drafts", icon: "file-text", badge: "2" },
            { name: "Brand Rulebook", id: "rulebook", icon: "book-open" },
        ];
    }
    else if (role === "brand-manager") {
        workspaceTitle = "Brand Manager Portal";
        navItems = [
            { name: "Approval Pipeline", id: "brand-manager", icon: "layers", badge: "2" },
            { name: "Active Drafts", id: "drafts", icon: "file-text" },
            { name: "Brand Rulebook", id: "rulebook", icon: "book-open" },
        ];
    }
    else if (role === "admin") {
        workspaceTitle = "Security & Admin";
        navItems = [
            { name: "Access & RBAC", id: "admin", icon: "users", badge: "3" },
            { name: "Database Studio", id: "database", icon: "database", badge: "Live" },
            { name: "Brand Rulebooks", id: "rulebook", icon: "book-open" },
        ];
    }
    return (React.createElement("aside", { class: "w-56 border-r border-slate-200 bg-slate-50/60 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3 hidden md:flex" },
        React.createElement("div", { class: "space-y-4" },
            React.createElement("div", { class: "px-3 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs" },
                React.createElement("div", { class: "text-[10px] font-bold uppercase tracking-wider text-slate-400" }, "Workspace"),
                React.createElement("div", { class: "flex items-center gap-2 mt-1" },
                    React.createElement("span", { class: "h-2 w-2 rounded-full bg-emerald-500" }),
                    React.createElement("span", { class: "text-xs font-bold text-slate-800" }, workspaceTitle))),
            React.createElement("div", { class: "space-y-1" },
                React.createElement("div", { class: "text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1" }, "Navigation"),
                React.createElement("nav", { class: "space-y-0.5" }, navItems.map(function (item) {
                    var isActive = activeView === item.id;
                    return (React.createElement("button", { key: item.id, onClick: function () { return onNavigate(item.id); }, class: "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ".concat(isActive ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900") },
                        React.createElement("div", { class: "flex items-center gap-2.5" },
                            React.createElement("i", { "data-lucide": item.icon, class: "w-4 h-4 ".concat(isActive ? "text-white" : "text-slate-500") }),
                            React.createElement("span", null, item.name)),
                        item.badge && (React.createElement("span", { class: "px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ".concat(isActive ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700") }, item.badge))));
                }))),
            React.createElement("div", { class: "rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-3 text-xs" },
                React.createElement("div", { class: "flex items-center gap-2 text-blue-900 font-bold mb-1" },
                    React.createElement("i", { "data-lucide": "shield-check", class: "w-4 h-4 text-blue-600" }),
                    React.createElement("span", null, "React Architecture")),
                React.createElement("p", { class: "text-[11px] text-slate-600 leading-relaxed" }, "Zero Next.js dependencies. Pure React reactive state."))),
        React.createElement("div", { class: "border-t border-slate-200 pt-3 text-[10px] text-slate-400 flex flex-col gap-1" },
            React.createElement("div", { class: "flex items-center justify-between font-mono" },
                React.createElement("span", null, "Platform"),
                React.createElement("span", { class: "text-emerald-600 font-bold" }, "React 18 SPA")),
            React.createElement("div", { class: "text-[9px] text-slate-400" }, "Multi-Device Synchronized"))));
}
// =========================================================================
// AUTHENTICATION COMPONENT (Sign In & Sign Up)
// =========================================================================
function AuthView(_a) {
    var _this = this;
    var onLoginSuccess = _a.onLoginSuccess, showToast = _a.showToast;
    var _b = useState("login"), tab = _b[0], setTab = _b[1];
    var _c = useState(""), email = _c[0], setEmail = _c[1];
    var _d = useState(""), password = _d[0], setPassword = _d[1];
    var _e = useState(""), name = _e[0], setName = _e[1];
    var _f = useState("Creative Growth"), department = _f[0], setDepartment = _f[1];
    var _g = useState("creator"), role = _g[0], setRole = _g[1];
    var _h = useState(""), error = _h[0], setError = _h[1];
    var _j = useState(false), loading = _j[0], setLoading = _j[1];
    var handleLogin = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/auth/login", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: email, password: password })
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setLoading(false);
                    if (!res.ok || !data.success) {
                        setError(data.error || "Invalid email or password.");
                        return [2 /*return*/];
                    }
                    onLoginSuccess(data.user);
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    setLoading(false);
                    setError("Network connection error: " + err_1.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSignup = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/auth/register", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: name, email: email, password: password, role: role, department: department })
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setLoading(false);
                    if (!res.ok || !data.success) {
                        setError(data.error || "Registration failed.");
                        return [2 /*return*/];
                    }
                    alert("Account registered in Database! Welcome, " + data.user.name);
                    onLoginSuccess(data.user);
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    setLoading(false);
                    setError("Database error: " + err_2.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var quickFill = function (em, pw) {
        setEmail(em);
        setPassword(pw);
    };
    return (React.createElement("div", { class: "flex items-center justify-center min-h-[calc(100vh-10rem)] p-4" },
        React.createElement("div", { class: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white" },
            React.createElement("div", { class: "flex items-center gap-3 mb-6" },
                React.createElement("div", { class: "w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30" },
                    React.createElement("i", { "data-lucide": "shield-check", class: "w-5 h-5" })),
                React.createElement("div", null,
                    React.createElement("h1", { class: "font-black text-lg tracking-tight" }, "Inkloom AI"),
                    React.createElement("p", { class: "text-xs text-slate-400" }, "Pre-Publication Governance Platform"))),
            React.createElement("div", { class: "flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/80 mb-6" },
                React.createElement("button", { onClick: function () { setTab("login"); setError(""); }, class: "flex-1 py-2 text-xs font-bold rounded-lg transition-all ".concat(tab === "login" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white") }, "Sign In"),
                React.createElement("button", { onClick: function () { setTab("signup"); setError(""); }, class: "flex-1 py-2 text-xs font-bold rounded-lg transition-all ".concat(tab === "signup" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white") }, "Create Account")),
            error && (React.createElement("div", { class: "p-3 mb-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2" },
                React.createElement("span", null, "\u2715"),
                React.createElement("span", null, error))),
            tab === "login" ? (React.createElement("form", { onSubmit: handleLogin, class: "space-y-4" },
                React.createElement("div", null,
                    React.createElement("label", { class: "block text-xs font-semibold text-slate-300 mb-1.5" }, "Email Address"),
                    React.createElement("input", { type: "email", required: true, value: email, onChange: function (e) { return setEmail(e.target.value); }, placeholder: "alex.creator@inkloom.ai", class: "w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" })),
                React.createElement("div", null,
                    React.createElement("label", { class: "block text-xs font-semibold text-slate-300 mb-1.5" }, "Password"),
                    React.createElement("input", { type: "password", required: true, value: password, onChange: function (e) { return setPassword(e.target.value); }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", class: "w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" })),
                React.createElement("button", { type: "submit", disabled: loading, class: "w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2" }, loading ? "Authenticating..." : "Sign In to Studio →"),
                React.createElement("div", { class: "pt-4 border-t border-slate-800 mt-6" },
                    React.createElement("div", { class: "text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center mb-3" }, "Instant Demo Personas"),
                    React.createElement("div", { class: "grid grid-cols-3 gap-2" },
                        React.createElement("button", { type: "button", onClick: function () { return quickFill("alex.creator@inkloom.ai", "creator123"); }, class: "p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all" },
                            React.createElement("div", { class: "text-[11px] font-bold text-blue-400" }, "Creator"),
                            React.createElement("div", { class: "text-[10px] text-slate-400 truncate" }, "Alex Morgan")),
                        React.createElement("button", { type: "button", onClick: function () { return quickFill("sarah.brand@inkloom.ai", "brand123"); }, class: "p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all" },
                            React.createElement("div", { class: "text-[11px] font-bold text-purple-400" }, "Manager"),
                            React.createElement("div", { class: "text-[10px] text-slate-400 truncate" }, "Sarah Chen")),
                        React.createElement("button", { type: "button", onClick: function () { return quickFill("marcus.admin@inkloom.ai", "admin123"); }, class: "p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all" },
                            React.createElement("div", { class: "text-[11px] font-bold text-emerald-400" }, "Admin"),
                            React.createElement("div", { class: "text-[10px] text-slate-400 truncate" }, "Marcus Vance")))))) : (React.createElement("form", { onSubmit: handleSignup, class: "space-y-3.5" },
                React.createElement("div", null,
                    React.createElement("label", { class: "block text-xs font-semibold text-slate-300 mb-1" }, "Full Name"),
                    React.createElement("input", { type: "text", required: true, value: name, onChange: function (e) { return setName(e.target.value); }, placeholder: "Anushka Bhaykar", class: "w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" })),
                React.createElement("div", null,
                    React.createElement("label", { class: "block text-xs font-semibold text-slate-300 mb-1" }, "Email Address"),
                    React.createElement("input", { type: "email", required: true, value: email, onChange: function (e) { return setEmail(e.target.value); }, placeholder: "anushka@agency.ai", class: "w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" })),
                React.createElement("div", null,
                    React.createElement("label", { class: "block text-xs font-semibold text-slate-300 mb-1" }, "Password"),
                    React.createElement("input", { type: "password", required: true, minlength: "6", value: password, onChange: function (e) { return setPassword(e.target.value); }, placeholder: "At least 6 characters", class: "w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" })),
                React.createElement("div", null,
                    React.createElement("label", { class: "block text-xs font-semibold text-slate-300 mb-1" }, "Department"),
                    React.createElement("input", { type: "text", value: department, onChange: function (e) { return setDepartment(e.target.value); }, placeholder: "Growth & Creative Studio", class: "w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" })),
                React.createElement("div", null,
                    React.createElement("label", { class: "block text-xs font-semibold text-slate-300 mb-1.5" }, "Assigned Governance Role"),
                    React.createElement("div", { class: "grid grid-cols-3 gap-2" },
                        React.createElement("button", { type: "button", onClick: function () { return setRole("creator"); }, class: "p-2 rounded-xl border text-center transition-all ".concat(role === "creator" ? "border-blue-500 bg-blue-950/40 text-blue-300 font-bold" : "border-slate-700 bg-slate-800 text-slate-400") },
                            React.createElement("div", { class: "text-xs" }, "Creator"),
                            React.createElement("div", { class: "text-[9px]" }, "Author")),
                        React.createElement("button", { type: "button", onClick: function () { return setRole("brand-manager"); }, class: "p-2 rounded-xl border text-center transition-all ".concat(role === "brand-manager" ? "border-purple-500 bg-purple-950/40 text-purple-300 font-bold" : "border-slate-700 bg-slate-800 text-slate-400") },
                            React.createElement("div", { class: "text-xs" }, "Manager"),
                            React.createElement("div", { class: "text-[9px]" }, "Reviewer")),
                        React.createElement("button", { type: "button", onClick: function () { return setRole("admin"); }, class: "p-2 rounded-xl border text-center transition-all ".concat(role === "admin" ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold" : "border-slate-700 bg-slate-800 text-slate-400") },
                            React.createElement("div", { class: "text-xs" }, "Admin"),
                            React.createElement("div", { class: "text-[9px]" }, "Full Access")))),
                React.createElement("button", { type: "submit", disabled: loading, class: "w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-2" }, loading ? "Registering in Database..." : "Register & Save Account →"))))));
}
// =========================================================================
// CREATOR STUDIO COMPONENT (Author Studio & Compliance Inspector)
// =========================================================================
function CreatorStudio(_a) {
    var _this = this;
    var user = _a.user, showToast = _a.showToast, onNavigate = _a.onNavigate;
    var _b = useState("text"), mode = _b[0], setMode = _b[1];
    var _c = useState("LoomCraft Studio"), brand = _c[0], setBrand = _c[1];
    var _d = useState("Launch day is finally here! ECLIPSE is guaranteed cheapest and 100% bug-free AI automation on the planet. Get lifetime free cloud compute before midnight!"), draftText = _d[0], setDraftText = _d[1];
    var _e = useState([]), findings = _e[0], setFindings = _e[1];
    var _f = useState(64), driftScore = _f[0], setDriftScore = _f[1];
    var _g = useState(false), inspecting = _g[0], setInspecting = _g[1];
    var _h = useState("text-lg font-black text-yellow-100 drop-shadow-sm"), bannerHeadlineCls = _h[0], setBannerHeadlineCls = _h[1];
    var runInspection = function () {
        setInspecting(true);
        setTimeout(function () {
            setInspecting(false);
            var detected = [];
            if (/100%\s*bug-free/i.test(draftText)) {
                detected.push({
                    id: "f_1",
                    category: "Legal & Claims",
                    severity: "critical",
                    title: "Prohibited Unsubstantiated Claim: '100% bug-free'",
                    desc: "Rule #RUL-001 forbids absolute defect-free claims. Rephrase to verified SLA.",
                    target: /100%\s*bug-free/gi,
                    replacement: "verified 99.99% availability"
                });
            }
            if (/guaranteed\s*cheapest/i.test(draftText)) {
                detected.push({
                    id: "f_2",
                    category: "Pricing & Superlatives",
                    severity: "high",
                    title: "Prohibited Superlative: 'guaranteed cheapest'",
                    desc: "Rule #RUL-002 bans price superlatives without audited price sheets.",
                    target: /guaranteed\s*cheapest/gi,
                    replacement: "transparent enterprise-tier pricing"
                });
            }
            if (/on\s*the\s*planet/i.test(draftText)) {
                detected.push({
                    id: "f_3",
                    category: "Tone & Voice",
                    severity: "medium",
                    title: "Hyperbolic Phrase: 'on the planet'",
                    desc: "Rule #RUL-004 recommends professional and factual authority.",
                    target: /on\s*the\s*planet/gi,
                    replacement: "in modern cloud infrastructure"
                });
            }
            setFindings(detected);
            setDriftScore(detected.length === 0 ? 0 : Math.min(95, detected.length * 32));
            showToast(detected.length === 0 ? "All brand rules passed!" : "".concat(detected.length, " rule violations detected!"), detected.length === 0 ? "success" : "error");
        }, 300);
    };
    var applyFix = function (item) {
        var updated = draftText.replace(item.target, item.replacement);
        setDraftText(updated);
        showToast("Applied fix: " + item.replacement);
        // Update findings locally
        var remaining = findings.filter(function (f) { return f.id !== item.id; });
        setFindings(remaining);
        setDriftScore(remaining.length === 0 ? 0 : Math.min(95, remaining.length * 32));
    };
    var submitDraft = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/workflow/submit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                draftId: "DRF-" + Math.floor(1000 + Math.random() * 9000),
                                title: "Campaign Copy (" + brand + ")",
                                content: draftText,
                                brand: brand,
                                authorName: user.name,
                                authorId: user.id
                            })
                        })];
                case 1:
                    _b.sent();
                    showToast("Draft submitted to Brand Manager approval pipeline!");
                    alert("Success! Your draft was submitted to Brand Manager Sarah Chen for review.");
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    showToast("Draft queued locally for review.");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { class: "space-y-6" },
        React.createElement("div", { class: "bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden" },
            React.createElement("div", { class: "relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" },
                React.createElement("div", null,
                    React.createElement("div", { class: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2" },
                        React.createElement("i", { "data-lucide": "sparkles", class: "w-3 h-3" }),
                        React.createElement("span", null, "CREATOR WORKSPACE")),
                    React.createElement("h1", { class: "text-2xl font-extrabold tracking-tight" },
                        "Welcome, ",
                        React.createElement("span", { class: "text-blue-300" }, user.name),
                        "!"),
                    React.createElement("p", { class: "text-xs text-blue-100/80 mt-1 max-w-xl" }, "Inspect marketing copy and visuals against live brand rules before publishing. Zero unapproved superlatives or legal drifts.")),
                React.createElement("div", { class: "flex items-center gap-2" },
                    React.createElement("span", { class: "text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-white/90" },
                        "Dept: ",
                        React.createElement("strong", null, user.department || "Creative Growth"))))),
        React.createElement("div", { class: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200" },
            React.createElement("div", { class: "flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl" },
                React.createElement("button", { onClick: function () { return setMode("text"); }, class: "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ".concat(mode === "text" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900") },
                    React.createElement("i", { "data-lucide": "file-text", class: "w-4 h-4 text-blue-600" }),
                    React.createElement("span", null, "Copy & Article Studio")),
                React.createElement("button", { onClick: function () { return setMode("banner"); }, class: "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ".concat(mode === "banner" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900") },
                    React.createElement("i", { "data-lucide": "image", class: "w-4 h-4 text-purple-600" }),
                    React.createElement("span", null, "Banner & Graphic Studio"))),
            React.createElement("div", { class: "flex items-center gap-2" },
                React.createElement("span", { class: "text-xs font-semibold text-slate-500" }, "Active Rulebook:"),
                React.createElement("select", { value: brand, onChange: function (e) { setBrand(e.target.value); showToast("Switched to " + e.target.value); }, class: "text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 shadow-xs focus:outline-none" },
                    React.createElement("option", { value: "LoomCraft Studio" }, "LoomCraft Studio (Creative Agency)"),
                    React.createElement("option", { value: "NovaPay" }, "NovaPay (Strict FinTech)"),
                    React.createElement("option", { value: "PulseHealth" }, "PulseHealth (Healthcare / HIPAA)")))),
        mode === "text" ? (React.createElement("div", { class: "grid grid-cols-1 lg:grid-cols-12 gap-6" },
            React.createElement("div", { class: "lg:col-span-7 space-y-4" },
                React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs" },
                    React.createElement("div", { class: "flex items-center justify-between mb-3" },
                        React.createElement("label", { class: "text-xs font-bold uppercase tracking-wider text-slate-500" }, "Draft Content / Copy"),
                        React.createElement("span", { class: "text-[11px] font-mono text-slate-400" },
                            draftText.length,
                            " characters")),
                    React.createElement("textarea", { rows: "8", value: draftText, onChange: function (e) { return setDraftText(e.target.value); }, class: "w-full text-xs font-normal leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:border-blue-500 transition-all" }),
                    React.createElement("div", { class: "mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100" },
                        React.createElement("div", { class: "flex items-center gap-2" },
                            React.createElement("button", { type: "button", onClick: function () { return setDraftText("Launch day is finally here! ECLIPSE is guaranteed cheapest and 100% bug-free AI automation on the planet."); }, class: "text-[11px] font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 px-2.5 py-1.5 rounded-lg" }, "Load Risky Sample"),
                            React.createElement("button", { type: "button", onClick: function () { setDraftText(""); setFindings([]); setDriftScore(0); }, class: "text-[11px] font-semibold text-slate-400 hover:text-red-600 bg-slate-100 px-2.5 py-1.5 rounded-lg" }, "Clear")),
                        React.createElement("button", { onClick: runInspection, disabled: inspecting, class: "px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2" },
                            React.createElement("i", { "data-lucide": "shield-check", class: "w-4 h-4" }),
                            React.createElement("span", null, inspecting ? "Inspecting..." : "Check Compliance & Rules")))),
                React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between" },
                    React.createElement("div", null,
                        React.createElement("div", { class: "text-xs font-bold text-slate-900" }, "Submit to Brand Manager Pipeline"),
                        React.createElement("p", { class: "text-[11px] text-slate-500 mt-0.5" }, "Locks draft into revision ledger and requests executive sign-off.")),
                    React.createElement("button", { onClick: submitDraft, class: "px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5" },
                        React.createElement("span", null, "Submit for Sign-Off \u2192")))),
            React.createElement("div", { class: "lg:col-span-5 space-y-4" },
                React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs" },
                    React.createElement("div", { class: "flex items-center justify-between mb-3" },
                        React.createElement("span", { class: "text-xs font-bold uppercase tracking-wider text-slate-500" }, "Compliance Drift Score"),
                        React.createElement("span", { class: "px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ".concat(driftScore === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200") }, driftScore === 0 ? "0% - Compliant" : "".concat(driftScore, "% Drift"))),
                    React.createElement("div", { class: "w-full bg-slate-100 rounded-full h-3 overflow-hidden" },
                        React.createElement("div", { class: "h-3 rounded-full transition-all duration-500 ".concat(driftScore === 0 ? "bg-emerald-500" : driftScore < 40 ? "bg-amber-500" : "bg-red-500"), style: { width: "".concat(Math.max(4, driftScore), "%") } })),
                    React.createElement("div", { class: "flex justify-between text-[10px] font-mono text-slate-400 mt-2" },
                        React.createElement("span", null, "0% (Perfect)"),
                        React.createElement("span", null, "100% (High Risk)"))),
                React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs" },
                    React.createElement("div", { class: "flex items-center justify-between mb-3" },
                        React.createElement("span", { class: "text-xs font-bold uppercase tracking-wider text-slate-500" }, "Detected Rule Findings"),
                        React.createElement("span", { class: "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600" },
                            findings.length,
                            " Items")),
                    findings.length === 0 ? (React.createElement("div", { class: "text-center py-6 text-xs text-emerald-600 bg-emerald-50/60 rounded-xl border border-emerald-200 p-4" },
                        React.createElement("div", { class: "font-bold" }, "All Brand Rules Passed!"),
                        React.createElement("div", { class: "text-[11px] text-emerald-700/80 mt-1" }, "Zero legal or voice violations detected."))) : (React.createElement("div", { class: "space-y-3" }, findings.map(function (f, i) { return (React.createElement("div", { key: f.id, class: "p-3.5 rounded-xl border border-red-200 bg-red-50/50 text-xs space-y-2" },
                        React.createElement("div", { class: "flex items-center justify-between" },
                            React.createElement("span", { class: "font-bold text-red-900" }, f.title),
                            React.createElement("span", { class: "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-200 text-red-800" }, f.severity)),
                        React.createElement("p", { class: "text-[11px] text-slate-600" }, f.desc),
                        React.createElement("div", { class: "pt-2 flex items-center justify-between border-t border-slate-200/60" },
                            React.createElement("span", { class: "text-[10px] font-mono text-slate-500" },
                                "Fix: \"",
                                f.replacement,
                                "\""),
                            React.createElement("button", { onClick: function () { return applyFix(f); }, class: "px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shadow-xs flex items-center gap-1" },
                                React.createElement("span", null, "1-Click Fix"))))); }))))))) : (React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4" },
            React.createElement("h2", { class: "text-sm font-bold text-slate-900" }, "Banner & Poster Visual Linter (WCAG AA)"),
            React.createElement("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-6 items-center" },
                React.createElement("div", { class: "rounded-xl border-2 border-dashed border-slate-300 p-6 bg-gradient-to-r from-amber-400 to-amber-200 flex flex-col justify-center items-center text-center min-h-[200px]" },
                    React.createElement("div", { class: bannerHeadlineCls }, "ECLIPSE: 100% BUG-FREE AI PLATFORM"),
                    React.createElement("div", { class: "text-xs text-yellow-100 font-medium mt-1" }, "Guaranteed cheapest velocity for teams")),
                React.createElement("div", { class: "space-y-3" },
                    React.createElement("div", { class: "p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs" },
                        React.createElement("div", { class: "flex items-center justify-between font-bold text-red-900 mb-1" },
                            React.createElement("span", null, "Contrast Failure: Yellow on Amber"),
                            React.createElement("span", { class: "font-mono text-red-700" }, "1.8:1 (Req: 4.5:1)")),
                        React.createElement("button", { onClick: function () { setBannerHeadlineCls("text-lg font-black text-slate-900 drop-shadow-sm"); showToast("Applied Slate-900 (12.4:1 contrast AA Pass)!"); }, class: "mt-2 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs" }, "1-Click Fix: Apply Slate-900 (12.4:1 Pass)"))))))));
}
// =========================================================================
// BRAND MANAGER COMPONENT (Pipeline & Tone Calibration)
// =========================================================================
function BrandManagerPortal(_a) {
    var _this = this;
    var user = _a.user, showToast = _a.showToast;
    var _b = useState("queue"), tab = _b[0], setTab = _b[1];
    var _c = useState(75), formality = _c[0], setFormality = _c[1];
    var _d = useState(60), boldness = _d[0], setBoldness = _d[1];
    var _e = useState(80), empathy = _e[0], setEmpathy = _e[1];
    var _f = useState([
        { id: "DRF-102", title: "Q4 Enterprise AI Cloud Launch Announcement", author: "Alex Morgan", brand: "LoomCraft Studio", compliance: 96, text: "We are excited to unveil our next-generation cloud infrastructure with verified 99.99% availability and SOC-2 Type II audit certification.", approved: false },
        { id: "DRF-103", title: "Cross-Border Payment Velocity Campaign", author: "Jordan Lee (Contractor)", brand: "NovaPay", compliance: 84, text: "NovaPay facilitates instantaneous cross-border multi-currency wire transfers with encrypted ledger safeguards.", approved: false },
    ]), drafts = _f[0], setDrafts = _f[1];
    var handleApprove = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/workflow/approve", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ draftId: id, managerName: user.name })
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3:
                    setDrafts(drafts.map(function (d) { return d.id === id ? __assign(__assign({}, d), { approved: true }) : d; }));
                    showToast("Draft ".concat(id, " approved and signed by ").concat(user.name, "!"));
                    return [2 /*return*/];
            }
        });
    }); };
    var handleReject = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/workflow/reject", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ draftId: id, managerName: user.name, reason: "Revisions requested" })
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3:
                    setDrafts(drafts.filter(function (d) { return d.id !== id; }));
                    showToast("Draft ".concat(id, " returned to author studio for revisions."));
                    return [2 /*return*/];
            }
        });
    }); };
    var sampleTone = "We partner with industry-leading teams to deliver resilient, verified digital governance.";
    if (formality > 80)
        sampleTone = "Pursuant to established institutional protocols, LoomCraft executes deterministic verification standards.";
    else if (boldness > 80)
        sampleTone = "We are revolutionizing cloud reliability. Defy downtime and deploy game-changing automation.";
    else if (empathy > 80)
        sampleTone = "We believe every team member deserves confidence and clarity in the software they depend on daily.";
    return (React.createElement("div", { class: "space-y-6" },
        React.createElement("div", { class: "bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden" },
            React.createElement("h1", { class: "text-2xl font-extrabold tracking-tight" },
                "Welcome, ",
                React.createElement("span", { class: "text-purple-300" }, user.name),
                "!"),
            React.createElement("p", { class: "text-xs text-purple-100/80 mt-1 max-w-xl" }, "Brand Governance Authority: Sign off on creator submissions and calibrate parametric voice dimensions.")),
        React.createElement("div", { class: "flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl w-fit" },
            React.createElement("button", { onClick: function () { return setTab("queue"); }, class: "px-4 py-2 rounded-lg text-xs font-bold transition-all ".concat(tab === "queue" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900") },
                "Approval Pipeline (",
                drafts.filter(function (d) { return !d.approved; }).length,
                ")"),
            React.createElement("button", { onClick: function () { return setTab("voice"); }, class: "px-4 py-2 rounded-lg text-xs font-bold transition-all ".concat(tab === "voice" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900") }, "Voice & Tone Calibration")),
        tab === "queue" ? (React.createElement("div", { class: "space-y-4" }, drafts.map(function (d) { return (React.createElement("div", { key: d.id, class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs" },
            React.createElement("div", { class: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100" },
                React.createElement("div", null,
                    React.createElement("div", { class: "flex items-center gap-2" },
                        React.createElement("span", { class: "text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200" }, d.id),
                        React.createElement("h3", { class: "text-sm font-bold text-slate-900" }, d.title)),
                    React.createElement("div", { class: "text-xs text-slate-500 mt-1" },
                        "Author: ",
                        React.createElement("strong", null, d.author),
                        " \u2022 Brand: ",
                        React.createElement("strong", null, d.brand))),
                React.createElement("span", { class: "text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" },
                    d.compliance,
                    "% Compliant")),
            React.createElement("p", { class: "py-3 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl my-3 italic" },
                "\"",
                d.text,
                "\""),
            React.createElement("div", { class: "flex items-center justify-between pt-2" },
                React.createElement("span", { class: "text-[11px] text-slate-500" },
                    "Status: ",
                    d.approved ? "Approved & Published" : "Pending Sign-off"),
                !d.approved ? (React.createElement("div", { class: "flex items-center gap-2" },
                    React.createElement("button", { onClick: function () { return handleReject(d.id); }, class: "px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-100" }, "Request Revisions"),
                    React.createElement("button", { onClick: function () { return handleApprove(d.id); }, class: "px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs" }, "Approve & Sign"))) : (React.createElement("span", { class: "text-xs font-bold text-emerald-600" }, "\u2713 Signed Off"))))); }))) : (React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6" },
            React.createElement("h2", { class: "text-sm font-bold text-slate-900" }, "Brand Voice Calibration Matrix"),
            React.createElement("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                React.createElement("div", { class: "p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2" },
                    React.createElement("div", { class: "flex justify-between text-xs font-bold" },
                        React.createElement("span", null, "Formality"),
                        React.createElement("span", { class: "font-mono text-purple-600" },
                            formality,
                            "%")),
                    React.createElement("input", { type: "range", min: "0", max: "100", value: formality, onChange: function (e) { return setFormality(Number(e.target.value)); }, class: "w-full accent-purple-600" })),
                React.createElement("div", { class: "p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2" },
                    React.createElement("div", { class: "flex justify-between text-xs font-bold" },
                        React.createElement("span", null, "Boldness"),
                        React.createElement("span", { class: "font-mono text-indigo-600" },
                            boldness,
                            "%")),
                    React.createElement("input", { type: "range", min: "0", max: "100", value: boldness, onChange: function (e) { return setBoldness(Number(e.target.value)); }, class: "w-full accent-indigo-600" })),
                React.createElement("div", { class: "p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2" },
                    React.createElement("div", { class: "flex justify-between text-xs font-bold" },
                        React.createElement("span", null, "Empathy"),
                        React.createElement("span", { class: "font-mono text-emerald-600" },
                            empathy,
                            "%")),
                    React.createElement("input", { type: "range", min: "0", max: "100", value: empathy, onChange: function (e) { return setEmpathy(Number(e.target.value)); }, class: "w-full accent-emerald-600" }))),
            React.createElement("div", { class: "p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 italic" },
                "\"",
                sampleTone,
                "\"")))));
}
// =========================================================================
// ADMIN SUITE COMPONENT
// =========================================================================
function AdminSuite(_a) {
    var user = _a.user, showToast = _a.showToast, onNavigate = _a.onNavigate;
    var _b = useState([]), users = _b[0], setUsers = _b[1];
    var _c = useState([]), logs = _c[0], setLogs = _c[1];
    useEffect(function () {
        fetch("/api/database/tables?table=users").then(function (r) { return r.json(); }).then(function (d) { return setUsers(d.rows || []); }).catch(function () { });
        fetch("/api/database/tables?table=audit_logs").then(function (r) { return r.json(); }).then(function (d) { return setLogs(d.rows || []); }).catch(function () { });
    }, []);
    return (React.createElement("div", { class: "space-y-6" },
        React.createElement("div", { class: "bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4" },
            React.createElement("div", null,
                React.createElement("h1", { class: "text-2xl font-extrabold tracking-tight" },
                    "Welcome, ",
                    React.createElement("span", { class: "text-emerald-300" }, user.name),
                    "!"),
                React.createElement("p", { class: "text-xs text-emerald-100/80 mt-1" }, "RBAC User Directory, Cryptographic Audit Trail, and Database Studio.")),
            React.createElement("button", { onClick: function () { return onNavigate("database"); }, class: "px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-sm flex items-center gap-2 shrink-0" },
                React.createElement("i", { "data-lucide": "database", class: "w-4 h-4" }),
                React.createElement("span", null, "Open Database Studio (9 Tables) \u2192"))),
        React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4" },
            React.createElement("h2", { class: "text-sm font-bold text-slate-900" }, "User Directory & RBAC Control"),
            React.createElement("div", { class: "overflow-x-auto" },
                React.createElement("table", { class: "w-full text-left text-xs" },
                    React.createElement("thead", { class: "bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200" },
                        React.createElement("tr", null,
                            React.createElement("th", { class: "py-2.5 px-3" }, "Name"),
                            React.createElement("th", { class: "py-2.5 px-3" }, "Role"),
                            React.createElement("th", { class: "py-2.5 px-3" }, "Department"),
                            React.createElement("th", { class: "py-2.5 px-3" }, "Email"))),
                    React.createElement("tbody", { class: "divide-y divide-slate-100" }, users.map(function (u) { return (React.createElement("tr", { key: u.id, class: "hover:bg-slate-50" },
                        React.createElement("td", { class: "py-2.5 px-3 font-bold text-slate-900" }, u.name),
                        React.createElement("td", { class: "py-2.5 px-3" },
                            React.createElement("span", { class: "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700" }, u.role)),
                        React.createElement("td", { class: "py-2.5 px-3 text-slate-600" }, u.department || "General"),
                        React.createElement("td", { class: "py-2.5 px-3 text-slate-500 font-mono text-[11px]" }, u.email))); })))))));
}
// =========================================================================
// DATABASE STUDIO COMPONENT (Strictly Admin Only)
// =========================================================================
function DatabaseStudio(_a) {
    var _this = this;
    var user = _a.user, showToast = _a.showToast;
    var _b = useState("users"), table = _b[0], setTable = _b[1];
    var _c = useState([]), rows = _c[0], setRows = _c[1];
    var _d = useState(""), supabaseUrl = _d[0], setSupabaseUrl = _d[1];
    var _e = useState(false), syncing = _e[0], setSyncing = _e[1];
    var _f = useState(""), syncMsg = _f[0], setSyncMsg = _f[1];
    var loadTable = function (tbl) {
        setTable(tbl);
        fetch("/api/database/tables?table=".concat(tbl))
            .then(function (r) { return r.json(); })
            .then(function (d) { return setRows(d.rows || []); })
            .catch(function (e) { return showToast("Error loading " + tbl, "error"); });
    };
    useEffect(function () { loadTable("users"); }, []);
    var handleConnectSupabase = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var res, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!supabaseUrl.trim())
                        return [2 /*return*/];
                    setSyncing(true);
                    setSyncMsg("Connecting to Supabase and running schema migration...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/database/connect", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ databaseUrl: supabaseUrl })
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setSyncing(false);
                    if (res.ok && data.success) {
                        setSyncMsg("Connected successfully to Supabase PostgreSQL! All 9 tables synced.");
                        showToast("Supabase Database Connected!");
                        loadTable(table);
                    }
                    else {
                        setSyncMsg("Failed to connect: " + (data.error || "Unknown error"));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    setSyncing(false);
                    setSyncMsg("Connection error: " + err_3.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var tableList = ["users", "audit_logs", "drafts", "rules", "guidelines", "approvals", "findings", "comments", "organizations"];
    return (React.createElement("div", { class: "space-y-6" },
        React.createElement("div", { class: "bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg" },
            React.createElement("div", { class: "text-[10px] font-mono font-bold text-emerald-400 mb-1" }, "ADMINISTRATOR ACCESS ONLY"),
            React.createElement("h1", { class: "text-2xl font-extrabold tracking-tight" }, "PostgreSQL & Supabase Database Studio"),
            React.createElement("p", { class: "text-xs text-emerald-100/80 mt-1" }, "Live inspection of all 9 relational tables and 1-click Supabase synchronization.")),
        React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3" },
            React.createElement("h2", { class: "text-sm font-bold text-slate-900" }, "Connect Live Supabase Database"),
            React.createElement("form", { onSubmit: handleConnectSupabase, class: "flex flex-col sm:flex-row gap-3" },
                React.createElement("input", { type: "text", value: supabaseUrl, onChange: function (e) { return setSupabaseUrl(e.target.value); }, placeholder: "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres", class: "flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none" }),
                React.createElement("button", { type: "submit", disabled: syncing, class: "px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shrink-0" }, syncing ? "Connecting..." : "Connect & Sync Supabase")),
            syncMsg && React.createElement("div", { class: "text-xs p-3 rounded-xl bg-slate-100 font-medium" }, syncMsg)),
        React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4" },
            React.createElement("div", { class: "flex flex-wrap gap-1.5" }, tableList.map(function (t) { return (React.createElement("button", { key: t, onClick: function () { return loadTable(t); }, class: "px-3 py-1.5 rounded-lg text-xs font-bold transition-all ".concat(table === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100") }, t)); })),
            React.createElement("div", { class: "flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono" },
                React.createElement("span", { class: "font-bold text-slate-900" },
                    "Table: ",
                    table),
                React.createElement("span", { class: "text-slate-500" },
                    rows.length,
                    " Rows")),
            React.createElement("div", { class: "overflow-x-auto rounded-xl border border-slate-200" },
                React.createElement("table", { class: "w-full text-left text-xs font-mono" },
                    React.createElement("thead", { class: "bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200" },
                        React.createElement("tr", null, rows.length > 0 && Object.keys(rows[0]).map(function (c) { return React.createElement("th", { key: c, class: "py-2.5 px-3 whitespace-nowrap" }, c); }))),
                    React.createElement("tbody", { class: "divide-y divide-slate-100 bg-white" }, rows.map(function (r, i) { return (React.createElement("tr", { key: i, class: "hover:bg-slate-50" }, Object.keys(rows[0]).map(function (c) {
                        var val = r[c];
                        if (typeof val === 'object' && val !== null)
                            val = JSON.stringify(val);
                        return React.createElement("td", { key: c, class: "py-2.5 px-3 whitespace-nowrap text-slate-800" }, String(val !== null && val !== void 0 ? val : 'null'));
                    }))); })))))));
}
// =========================================================================
// DRAFTS VIEW
// =========================================================================
function DraftsView(_a) {
    var user = _a.user, onNavigate = _a.onNavigate;
    var _b = useState([]), drafts = _b[0], setDrafts = _b[1];
    useEffect(function () {
        fetch("/api/drafts").then(function (r) { return r.json(); }).then(function (d) { return setDrafts(d.drafts || []); }).catch(function () { });
    }, []);
    return (React.createElement("div", { class: "space-y-6" },
        React.createElement("div", { class: "flex justify-between items-center pb-4 border-b border-slate-200" },
            React.createElement("div", null,
                React.createElement("h1", { class: "text-xl font-bold text-slate-900" }, "Active Drafts Ledger"),
                React.createElement("p", { class: "text-xs text-slate-500" }, "All marketing assets stored in the relational database.")),
            user.role === "creator" && (React.createElement("button", { onClick: function () { return onNavigate("creator"); }, class: "px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold" }, "+ New Studio Draft"))),
        React.createElement("div", { class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs" },
            React.createElement("div", { class: "overflow-x-auto" },
                React.createElement("table", { class: "w-full text-left text-xs" },
                    React.createElement("thead", { class: "bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200" },
                        React.createElement("tr", null,
                            React.createElement("th", { class: "py-2.5 px-3" }, "Title"),
                            React.createElement("th", { class: "py-2.5 px-3" }, "Brand"),
                            React.createElement("th", { class: "py-2.5 px-3" }, "Author"),
                            React.createElement("th", { class: "py-2.5 px-3" }, "Status"))),
                    React.createElement("tbody", { class: "divide-y divide-slate-100" }, drafts.map(function (d) { return (React.createElement("tr", { key: d.id, class: "hover:bg-slate-50" },
                        React.createElement("td", { class: "py-3 px-3 font-bold text-slate-900" }, d.title),
                        React.createElement("td", { class: "py-3 px-3 text-slate-600" }, d.brand || "LoomCraft Studio"),
                        React.createElement("td", { class: "py-3 px-3 text-slate-600" }, d.author || "Author"),
                        React.createElement("td", { class: "py-3 px-3" },
                            React.createElement("span", { class: "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700" }, d.status)))); })))))));
}
// =========================================================================
// RULEBOOK VIEW
// =========================================================================
function RulebookView() {
    var _a = useState("LoomCraft Studio"), brand = _a[0], setBrand = _a[1];
    var rules = [
        { id: "RUL-001", name: "Absolute Claims Prohibition", category: "Legal", severity: "critical", desc: "No copy may claim '100% bug-free', 'unbreakable', or 'zero flaws'." },
        { id: "RUL-002", name: "Superlative Cost Restriction", category: "Pricing", severity: "high", desc: "Phrases like 'guaranteed cheapest' are prohibited without verified price sheets." },
        { id: "RUL-003", name: "WCAG AA Contrast Minimum", category: "Visual", severity: "critical", desc: "Body text must have minimum 4.5:1 contrast against backdrop." },
        { id: "RUL-004", name: "Brand Voice Hyperbole Filter", category: "Voice & Tone", severity: "medium", desc: "Avoid sensationalist expressions such as 'on the planet'." }
    ];
    return (React.createElement("div", { class: "space-y-6" },
        React.createElement("div", { class: "flex justify-between items-center pb-4 border-b border-slate-200" },
            React.createElement("div", null,
                React.createElement("h1", { class: "text-xl font-bold text-slate-900" }, "Multi-Brand Governance Rulebook"),
                React.createElement("p", { class: "text-xs text-slate-500" }, "Enforced regulatory standards, prohibited terminology, and contrast requirements."))),
        React.createElement("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-4" }, rules.map(function (r) { return (React.createElement("div", { key: r.id, class: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2" },
            React.createElement("div", { class: "flex justify-between text-xs font-mono font-bold" },
                React.createElement("span", { class: "text-slate-500" }, r.id),
                React.createElement("span", { class: "px-2 py-0.5 rounded text-[10px] uppercase bg-red-50 text-red-700 border border-red-200" }, r.severity)),
            React.createElement("h3", { class: "text-sm font-bold text-slate-900" }, r.name),
            React.createElement("p", { class: "text-xs text-slate-600" }, r.desc))); }))));
}
// Mount React App
var root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App, null));
