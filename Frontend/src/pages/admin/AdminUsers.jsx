import React, { useState, useEffect, useMemo } from "react";
import { Users, Search, RefreshCw, Mail, Phone, Calendar, ShieldCheck, User } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import TableSortControl from "../../components/admin/TableSortControl";

const USER_SORT_OPTIONS = [
  { value: "name_asc", label: "Customer Name: A to Z" },
  { value: "name_desc", label: "Customer Name: Z to A" },
  { value: "newest", label: "Recent First (Newest Joined)" },
  { value: "oldest", label: "Oldest Joined First" },
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");

  const token = localStorage.getItem("token");

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/auth/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load customers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const filteredUsers = useMemo(() => {
    const list = users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
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
  }, [users, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Registered Customers ({users.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View all shopper accounts, customer phone numbers, and profile details
          </p>
        </div>

        <button
          onClick={fetchUsersList}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#e8703b]" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search Bar & Sort */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition"
          />
        </div>

        <TableSortControl
          value={sortBy}
          onChange={setSortBy}
          options={USER_SORT_OPTIONS}
          label="Sort customers"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Role / Access</th>
                <th className="py-3.5 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e8703b]" />
                    <span>Loading customers...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-600">No customers found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initial = (user.name || "U")[0].toUpperCase();
                  const isAdmin = !!user.isAdmin;

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/60 transition">
                      {/* Name with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              isAdmin
                                ? "bg-[#e8703b]/20 text-[#e8703b] border border-[#e8703b]/30"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name || "Anonymous User"}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ID: {user._id?.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        {user.email ? (
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No email linked</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        {user.phone ? (
                          <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone linked</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {user.isPrimaryAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            <span>Primary Admin</span>
                          </span>
                        ) : user.role === "admin" || isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Administrator</span>
                          </span>
                        ) : user.role && user.role !== "customer" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span className="capitalize">{user.role.replace("_", " ")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <User className="w-3 h-3" />
                            <span>Customer</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
