import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiTrash2,
  FiUserX,
  FiUserCheck,
  FiUser,
} from "react-icons/fi";
import {
  getAdminUsers,
  updateUserRole,
  toggleUserBlock,
  deleteUser,
} from "../utils/adminAPI";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
  });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ✅ Logged-in admin id (SELF PROTECTION)
  const loggedInAdminId = localStorage.getItem("admin_userId");

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAdminUsers(currentPage, 20, filters);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalUsers(response.totalUsers);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  /* ================= FILTERS ================= */
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", role: "all" });
    setCurrentPage(1);
  };

  /* ================= ROLE UPDATE ================= */
  const handleRoleUpdate = async (userId, newRole) => {
    if (userId === loggedInAdminId) {
      alert("You cannot ensure your own admin role.");
      return;
    }

    const user = users.find((u) => u._id === userId);
    if (!user) return;

    if (
      window.confirm(
        `Change role from ${user.role.toUpperCase()} to ${newRole.toUpperCase()}?`
      )
    ) {
      try {
        await updateUserRole(userId, newRole);
        fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  /* ================= BLOCK / UNBLOCK ================= */
  const handleBlockToggle = async (userId, isBlocked) => {
    if (userId === loggedInAdminId) {
      alert("You cannot block your own admin account.");
      return;
    }

    const action = isBlocked ? "Unblock" : "Block";

    if (window.confirm(`${action} this user?`)) {
      try {
        await toggleUserBlock(userId, !isBlocked);
        fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  /* ================= DELETE USER (SAFE) ================= */
  const handleDelete = async (userId) => {
    if (userId === loggedInAdminId) {
      alert("You cannot delete your own admin account.");
      return;
    }

    if (confirmDelete === userId) {
      try {
        await deleteUser(userId);
        setConfirmDelete(null);
        fetchUsers();
      } catch (err) {
        alert(err.message);
        setConfirmDelete(null);
      }
    } else {
      setConfirmDelete(userId);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  /* ================= RENDER ================= */
  return (
    <div className="admin-users">
      <div className="admin-page-header">
        <h1>User Management</h1>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <div className="filter-item">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) =>
                handleFilterChange("search", e.target.value)
              }
            />
          </div>

          <div className="filter-item">
            <label>Role</label>
            <select
              value={filters.role}
              onChange={(e) =>
                handleFilterChange("role", e.target.value)
              }
            >
              <option value="all">All</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {(filters.search || filters.role !== "all") && (
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="admin-loading">
          <FiRefreshCw className="spinner" />
          <p>Loading users...</p>
        </div>
      )}

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <strong>{user.name}</strong>
                        <div className="user-id">
                          ID: {user._id.slice(0, 8)}…
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <select
                          value={user.role}
                          className={`role-select ${user.role}`}
                          disabled={user._id === loggedInAdminId}
                          onChange={(e) =>
                            handleRoleUpdate(user._id, e.target.value)
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        {user._id === loggedInAdminId && (
                          <FiUser title="This is you" />
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            user.isBlocked
                              ? "status-blocked"
                              : "status-active"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td>{formatDate(user.createdAt)}</td>

                      <td className="actions-cell">
                        <button
                          className={`btn btn-sm ${
                            user.isBlocked
                              ? "btn-success"
                              : "btn-warning"
                          }`}
                          onClick={() =>
                            handleBlockToggle(user._id, user.isBlocked)
                          }
                        >
                          {user.isBlocked ? (
                            <FiUserCheck />
                          ) : (
                            <FiUserX />
                          )}
                        </button>

                        <button
                          className={`btn btn-sm ${
                            confirmDelete === user._id
                              ? "btn-danger"
                              : "btn-outline"
                          }`}
                          onClick={() => handleDelete(user._id)}
                        >
                          {confirmDelete === user._id
                            ? "Confirm"
                            : <FiTrash2 />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((p) => Math.max(p - 1, 1))
                }
              >
                <FiChevronLeft /> Prev
              </button>

              <span>
                Page {currentPage} of {totalPages} ({totalUsers})
              </span>

              <button
                className="btn btn-outline"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(p + 1, totalPages)
                  )
                }
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminUsers;
