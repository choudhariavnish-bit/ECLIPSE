/**
 * Inkloom AI / ECLIPSE - Universal Client Script
 * Handles Authentication, Strict Role Protection, Navbar/Sidebar rendering, and Toasts.
 */

const App = {
  // Get active session
  getUser() {
    try {
      const stored = localStorage.getItem("inkloom_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getRole() {
    const user = this.getUser();
    return user ? user.role : localStorage.getItem("inkloom_role") || "creator";
  },

  setUser(user) {
    localStorage.setItem("inkloom_user", JSON.stringify(user));
    localStorage.setItem("inkloom_role", user.role);
  },

  logout() {
    localStorage.removeItem("inkloom_user");
    localStorage.removeItem("inkloom_role");
    window.location.href = "/index.html";
  },

  // Enforce strict Role-Based Access Control on page load
  requireAuth(allowedRoles = []) {
    const user = this.getUser();
    if (!user) {
      window.location.href = "/index.html";
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert("Access Denied: Your role (" + user.role + ") does not have permission to view this page.");
      if (user.role === "creator") window.location.href = "/creator.html";
      else if (user.role === "brand-manager") window.location.href = "/brand-manager.html";
      else window.location.href = "/admin.html";
      return false;
    }
    return true;
  },

  // Toast notification
  showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const isSuccess = type === "success";
    toast.className = "pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-semibold animate-bounce " +
      (isSuccess ? "bg-slate-900 text-white border-slate-800" : "bg-red-900 text-white border-red-800");

    toast.innerHTML = (isSuccess
      ? '<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      : '<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>') +
      '<span>' + message + '</span>';

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s ease";
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },

  // Render standard Navbar across pages
  renderNavbar(activePage = "") {
    const nav = document.getElementById("main-navbar");
    if (!nav) return;

    const user = this.getUser() || { name: "Alex Morgan", role: "creator", department: "Content & Marketing" };
    const role = user.role || "creator";
    const initials = (user.name || "User").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const roleMeta = {
      creator: { label: "Author Studio", badge: "bg-blue-50 text-blue-800 border-blue-200" },
      "brand-manager": { label: "Brand Manager", badge: "bg-purple-50 text-purple-800 border-purple-200" },
      admin: { label: "Security & Admin", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    }[role] || { label: "Workspace", badge: "bg-slate-100 text-slate-800 border-slate-200" };

    nav.innerHTML = `
      <header class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
        <div class="flex h-14 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
          <!-- Left: Brand Logo -->
          <a href="${role === 'creator' ? '/creator.html' : role === 'brand-manager' ? '/brand-manager.html' : '/admin.html'}" class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm tracking-tight text-slate-900">Inkloom AI</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">Governance</span>
            </div>
          </a>

          <!-- Right: Status, Role & Profile -->
          <div class="flex items-center gap-3">
            <!-- Database Studio badge ONLY shown for Admin -->
            ${role === 'admin' ? `
              <a href="/database.html" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                <i data-lucide="database" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span>Database Studio</span>
                <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </a>
            ` : ''}

            <!-- Active Workspace Badge -->
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${roleMeta.badge}">
              <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>${roleMeta.label}</span>
            </div>

            <!-- User Info & Logout -->
            <div class="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div class="h-8 w-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                ${initials}
              </div>
              <div class="hidden md:block text-right">
                <div class="text-xs font-bold text-slate-900">${user.name || "Author"}</div>
                <div class="text-[10px] text-slate-500">${user.department || user.email || "Content & Growth"}</div>
              </div>
              <button onclick="App.logout()" title="Sign Out" class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors">
                <i data-lucide="log-out" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // Render Sidebar strictly by role
  renderSidebar(activePage = "") {
    const sidebar = document.getElementById("main-sidebar");
    if (!sidebar) return;

    const role = this.getRole();
    let navItems = [];
    let workspaceTitle = "Author Studio";

    if (role === "creator") {
      workspaceTitle = "Author Studio";
      navItems = [
        { name: "Compliance Inspector", href: "/creator.html", icon: "check-square", id: "creator" },
        { name: "Active Drafts", href: "/drafts.html", icon: "file-text", id: "drafts", badge: "2" },
        { name: "Brand Rulebook", href: "/rulebook.html", icon: "book-open", id: "rulebook" },
      ];
    } else if (role === "brand-manager") {
      workspaceTitle = "Brand Manager Portal";
      navItems = [
        { name: "Approval Pipeline", href: "/brand-manager.html", icon: "layers", id: "brand-manager", badge: "2" },
        { name: "Active Drafts", href: "/drafts.html", icon: "file-text", id: "drafts" },
        { name: "Brand Rulebook", href: "/rulebook.html", icon: "book-open", id: "rulebook" },
      ];
    } else if (role === "admin") {
      workspaceTitle = "Security & Admin";
      navItems = [
        { name: "Access & RBAC", href: "/admin.html", icon: "users", id: "admin", badge: "3" },
        { name: "Database Studio", href: "/database.html", icon: "database", id: "database", badge: "Live" },
        { name: "Brand Rulebooks", href: "/rulebook.html", icon: "book-open", id: "rulebook" },
      ];
    }

    sidebar.innerHTML = `
      <aside class="w-56 border-r border-slate-200 bg-slate-50/60 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3 hidden md:flex">
        <div class="space-y-4">
          <!-- Role Indicator -->
          <div class="px-3 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span class="text-xs font-bold text-slate-800">${workspaceTitle}</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">Navigation</div>
            <nav class="space-y-0.5">
              ${navItems.map(item => {
                const isActive = activePage === item.id;
                return `
                  <a href="${item.href}" class="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
                    isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }">
                    <div class="flex items-center gap-2.5">
                      <i data-lucide="${item.icon}" class="w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}"></i>
                      <span>${item.name}</span>
                    </div>
                    ${item.badge ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                    }">${item.badge}</span>` : ''}
                  </a>
                `;
              }).join("")}
            </nav>
          </div>

          <!-- Guard Banner -->
          <div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-3 text-xs">
            <div class="flex items-center gap-2 text-blue-900 font-bold mb-1">
              <i data-lucide="shield-check" class="w-4 h-4 text-blue-600"></i>
              <span>Deterministic Guard</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              Standard Normal HTML Architecture. Zero Next.js overhead.
            </p>
          </div>
        </div>

        <div class="border-t border-slate-200 pt-3 text-[10px] text-slate-400 flex flex-col gap-1">
          <div class="flex items-center justify-between font-mono">
            <span>Inkloom Core</span>
            <span class="text-emerald-600 font-bold">HTML5 + Node</span>
          </div>
          <div class="text-[9px] text-slate-400">Universal Multi-Device Sync</div>
        </div>
      </aside>
    `;

    if (window.lucide) window.lucide.createIcons();
  },
};

