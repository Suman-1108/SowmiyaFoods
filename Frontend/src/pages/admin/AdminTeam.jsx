import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, UserPlus, ShieldCheck, Edit2, Trash2, RefreshCw, X,
  Lock, Mail, Phone, User, Eye, EyeOff, CheckCircle2,
  AlertTriangle, Power, Crown, Loader2, Search,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import TableSortControl from "../../components/admin/TableSortControl";

const TEAM_SORT_OPTIONS = [
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
  { value: "newest", label: "Recent First (Newest)" },
  { value: "oldest", label: "Oldest First" },
];

// ─── Role metadata (mirrors backend) ─────────────────────────────────────────
const ROLE_META = {
  admin: {
    name: "Admin (Owner)",
    badge: "bg-purple-100 text-purple-700 border-purple-300",
    dot: "bg-purple-500",
    icon: Crown,
  },
  manager: {
    name: "Operations Manager",
    badge: "bg-blue-100 text-blue-700 border-blue-300",
    dot: "bg-blue-500",
    icon: ShieldCheck,
  },
  order_manager: {
    name: "Order Specialist",
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    dot: "bg-amber-500",
    icon: ShieldCheck,
  },
  catalog_specialist: {
    name: "Catalog Specialist",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-300",
    dot: "bg-emerald-500",
    icon: ShieldCheck,
  },
  viewer: {
    name: "Support / Viewer",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
    icon: User,
  },
  custom: {
    name: "Custom Role",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-300",
    dot: "bg-indigo-500",
    icon: ShieldCheck,
  },
};

// All available permissions in the system
const ALL_PERMISSIONS = [
  { key: "dashboard:view", label: "View Dashboard", group: "Dashboard" },
  { key: "products:view", label: "View Products", group: "Products" },
  { key: "products:create", label: "Create Products", group: "Products" },
  { key: "products:edit", label: "Edit Products", group: "Products" },
  { key: "products:delete", label: "Delete Products", group: "Products" },
  { key: "orders:view", label: "View Orders", group: "Orders" },
  { key: "orders:update", label: "Update Order Status", group: "Orders" },
  { key: "orders:delete", label: "Delete Orders", group: "Orders" },
  { key: "customers:view", label: "View Customers", group: "Customers" },
  { key: "customers:manage", label: "Manage Customers", group: "Customers" },
  { key: "settings:view", label: "View Settings", group: "Settings" },
  { key: "settings:manage", label: "Manage Settings", group: "Settings" },
  { key: "team:manage", label: "Manage Team & Roles", group: "Team" },
];

const ROLE_DEFAULT_PERMS = {
  manager: ["dashboard:view","products:view","products:create","products:edit","orders:view","orders:update","customers:view","settings:view"],
  order_manager: ["dashboard:view","orders:view","orders:update","customers:view"],
  catalog_specialist: ["dashboard:view","products:view","products:create","products:edit"],
  viewer: ["dashboard:view","products:view","orders:view","customers:view","settings:view"],
  custom: [],
};

const grouped = ALL_PERMISSIONS.reduce((acc, p) => {
  if (!acc[p.group]) acc[p.group] = [];
  acc[p.group].push(p);
  return acc;
}, {});

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const meta = ROLE_META[role] || ROLE_META.viewer;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.name}
    </span>
  );
};

// ─── Staff Modal ──────────────────────────────────────────────────────────────
const StaffModal = ({ mode, staff, onClose, onSaved }) => {
  const isEdit = mode === "edit";
  const [name, setName] = useState(staff?.name || "");
  const [email, setEmail] = useState(staff?.email || "");
  const [phone, setPhone] = useState(staff?.phone || "");
  const [role, setRole] = useState(staff?.role || "manager");
  const [permissions, setPermissions] = useState(
    staff?.permissions && staff.permissions.length > 0
      ? staff.permissions
      : ROLE_DEFAULT_PERMS["manager"] || []
  );
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isActive, setIsActive] = useState(staff?.isActive !== false);
  const [saving, setSaving] = useState(false);

  // When role changes, auto-fill default permissions
  const handleRoleChange = (r) => {
    setRole(r);
    if (r !== "custom" && !isEdit) {
      setPermissions(ROLE_DEFAULT_PERMS[r] || []);
    } else if (r !== "custom") {
      setPermissions(ROLE_DEFAULT_PERMS[r] || []);
    }
  };

  const togglePerm = (key) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    if (!isEdit && !password) {
      toast.error("Password is required for new staff members.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/auth/admin/staff/${staff._id || staff.id}`, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role,
          permissions,
          isActive,
          ...(password ? { password } : {}),
        });
        toast.success(`${name}'s profile updated!`);
      } else {
        await axiosInstance.post("/auth/admin/staff", {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role,
          permissions,
          password,
        });
        toast.success(`${name} added to the team as ${ROLE_META[role]?.name || role}!`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save staff member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isEdit ? `Edit — ${staff?.name}` : "Add Team Member"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? "Update role, permissions, or access." : "Assign role, credentials, and permissions."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name + Email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Team Member Name"
                  disabled={staff?.isPrimaryAdmin}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent bg-slate-50 placeholder-slate-400 disabled:opacity-60"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@sowmiya.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent bg-slate-50 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Phone + Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Phone <span className="text-slate-400 normal-case font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent bg-slate-50 placeholder-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                {isEdit ? "New Password" : "Password"}{" "}
                {isEdit && <span className="text-slate-400 normal-case font-normal">(leave blank to keep)</span>}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEdit ? "••••••••" : "Min 6 characters"}
                  required={!isEdit}
                  className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent bg-slate-50 placeholder-slate-400"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role Selector */}
          {!staff?.isPrimaryAdmin && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Role Template
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["manager", "order_manager", "catalog_specialist", "viewer", "custom"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                      role === r
                        ? "bg-[#e8703b] text-white border-[#e8703b] shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-[#e8703b] hover:text-[#e8703b]"
                    }`}
                  >
                    {ROLE_META[r]?.name || r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Permissions Matrix */}
          {!staff?.isPrimaryAdmin && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                Permission Matrix
              </label>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4">
                {Object.entries(grouped).map(([group, perms]) => (
                  <div key={group}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{group}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {perms.map((p) => (
                        <label
                          key={p.key}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer transition group"
                        >
                          <input
                            type="checkbox"
                            checked={permissions.includes(p.key)}
                            onChange={() => togglePerm(p.key)}
                            className="w-3.5 h-3.5 accent-[#e8703b] cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900 transition">
                            {p.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active/Inactive toggle (edit mode only) */}
          {isEdit && !staff?.isPrimaryAdmin && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-800">Account Status</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isActive ? "Account is active and can sign in" : "Account is suspended — cannot sign in"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {isActive ? "Active" : "Suspended"}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] transition cursor-pointer disabled:opacity-60 shadow-lg shadow-orange-500/20"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /><span>{isEdit ? "Save Changes" : "Add Member"}</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirmation ──────────────────────────────────────────────────────
const DeleteConfirm = ({ staff, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/auth/admin/staff/${staff._id || staff.id}`);
      toast.success(`${staff.name} removed from team.`);
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete staff member.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">Remove Team Member?</h3>
        <p className="text-sm text-slate-500 mb-1">
          Are you sure you want to remove{" "}
          <span className="font-bold text-slate-800">{staff.name}</span> from the team?
        </p>
        <p className="text-xs text-slate-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition cursor-pointer disabled:opacity-60"
          >
            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Removing...</span></> : "Yes, Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminTeam Component ─────────────────────────────────────────────────
const AdminTeam = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [modal, setModal] = useState(null); // null | { mode: "add" | "edit", staff?: {} }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/auth/admin/staff");
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filtered = useMemo(() => {
    const list = staff.filter((m) => {
      const q = search.toLowerCase();
      return (
        !q ||
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.role || "").toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name_desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [staff, search, sortBy]);

  // Metrics
  const totalStaff = staff.length;
  const activeCount = staff.filter((m) => m.isActive !== false).length;
  const roleBreakdown = staff.reduce((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Team & Staff Management
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#e8703b]/10 text-[#e8703b] rounded-full">
              {totalStaff} Members
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage admin staff members, assign sub-admin access roles, and set custom section permissions
          </p>
        </div>

        <button
          onClick={() => setModal({ mode: "add" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Staff</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalStaff}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Accounts</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Full Admins</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{roleBreakdown.admin || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Sub-Admin Specialists</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {totalStaff - (roleBreakdown.admin || 0)}
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <TableSortControl
          value={sortBy}
          onChange={setSortBy}
          options={TEAM_SORT_OPTIONS}
          label="Sort staff members"
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Permissions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#e8703b]" />
                    <span className="text-sm">Loading team members...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-25 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-500">
                      {search ? "No members match your search" : "No team members yet"}
                    </p>
                    {!search && (
                      <button
                        onClick={() => setModal({ mode: "add" })}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#e8703b] hover:text-[#d65f29] cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add your first team member
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((member) => {
                  const initials = (member.name || "?").slice(0, 2).toUpperCase();
                  const isPrimary = !!member.isPrimaryAdmin;
                  const isActive = member.isActive !== false;
                  const perms = member.permissions || [];
                  const isWildcard = perms.includes("*");

                  return (
                    <tr key={member._id || member.id} className="hover:bg-slate-50/60 transition">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                            isPrimary
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {member.name}
                              {isPrimary && (
                                <Crown className="w-3 h-3 text-purple-500" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {(member._id || member.id || "").slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {member.email && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <RoleBadge role={member.role || "viewer"} />
                      </td>

                      {/* Permissions */}
                      <td className="py-3.5 px-4">
                        {isWildcard ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                            <CheckCircle2 className="w-3 h-3" /> Full Access (*)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {perms.slice(0, 3).map((p) => (
                              <span key={p} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                {p.split(":")[1] || p}
                              </span>
                            ))}
                            {perms.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-[#e8703b] border border-orange-200">
                                +{perms.length - 3} more
                              </span>
                            )}
                            {perms.length === 0 && (
                              <span className="text-slate-400 italic">No permissions</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal({ mode: "edit", staff: member })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isPrimary && (
                            <button
                              onClick={() => setDeleteTarget(member)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-700">Azure-Style Role-Based Access Control</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            Each role has a predefined permission set. Use <strong>Custom Role</strong> for granular control.
            The <strong>Primary Admin (Crown)</strong> has unrestricted system access and cannot be demoted or removed.
            Staff members only see the portal sections they are permitted to access.
          </p>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <StaffModal
          mode={modal.mode}
          staff={modal.staff}
          onClose={() => setModal(null)}
          onSaved={fetchStaff}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          staff={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={fetchStaff}
        />
      )}
    </div>
  );
};

export default AdminTeam;
