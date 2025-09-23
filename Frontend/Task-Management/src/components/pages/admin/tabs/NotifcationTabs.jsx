import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

const NotificationsTab = () => {
  const { user } = useAuth();
  
  // State management
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form states
  const [message, setMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [type, setType] = useState("info");
  const [priority, setPriority] = useState("normal");
  const [expiresAt, setExpiresAt] = useState("");
  
  // Edit states
  const [editingNotification, setEditingNotification] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [editType, setEditType] = useState("info");
  const [editPriority, setEditPriority] = useState("normal");
  
  // UI states
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showSendForm, setShowSendForm] = useState(false);

  // Constants
  const notificationTypes = ["info", "warning", "alert", "task", "report"];
  const priorities = ["low", "normal", "high", "urgent"];
  const canSendToAll = ["admin", "teamlead"].includes(user?.role?.toLowerCase());
  const canSendToUsers = ["admin", "teamlead"].includes(user?.role?.toLowerCase());
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Generic API helper with comprehensive error handling
  const apiCall = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${options.method || 'GET'}] ${url}:`, err);
      throw err;
    }
  }, []);

  // Fetch notifications based on user role
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setError("");
      let endpoint = `/notifications/my?page=${page}&limit=20`;
      
      if (filterType !== 'all') {
        endpoint += `&type=${filterType}`;
      }
      
      if (filterUnreadOnly) {
        endpoint += `&unreadOnly=true`;
      }
      
      // Admin can see all notifications
      if (user?.role === "admin") {
        endpoint = `/admin/notifications/admin/all?page=${page}&limit=20`;
        if (filterType !== 'all') {
          endpoint += `&type=${filterType}`;
        }
      }
      
      const data = await apiCall(endpoint);
      
      if (user?.role === "admin" && data.notifications) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setPagination(data.pagination);
      } else {
        setNotifications(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (err) {
      setError(`Failed to fetch notifications: ${err.message}`);
      setNotifications([]);
    }
  }, [user?.role, filterType, filterUnreadOnly, apiCall]);

  // Fetch notification statistics
  const fetchStats = useCallback(async () => {
    try {
      const data = await apiCall("/notifications/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [apiCall]);

  // Fetch all users for sending notifications
  const fetchUsers = useCallback(async () => {
    try {
      if (!["admin", "teamlead"].includes(user?.role?.toLowerCase())) return;
      
      const data = await apiCall("/notifications/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    }
  }, [user?.role, apiCall]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchNotifications(currentPage);
      fetchStats();
      fetchUsers();
    }
  }, [user, currentPage, fetchNotifications, fetchStats, fetchUsers]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Utility function to show success message
  const showSuccess = (msg) => {
    setSuccess(msg);
    setError("");
  };

  // Utility function to show error message
  const showError = (msg) => {
    setError(msg);
    setSuccess("");
  };

  // Send notification to specific users
  const sendNotificationToUsers = async () => {
    if (!message.trim()) {
      showError("Message is required");
      return;
    }

    if (selectedUsers.length === 0) {
      showError("Please select at least one user");
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall("/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          receivers: selectedUsers,
          message: message.trim(),
          type,
          priority,
          expiresAt: expiresAt || undefined,
        }),
      });

      showSuccess(result.message || "Notification sent successfully!");
      resetForm();
      await Promise.all([fetchNotifications(currentPage), fetchStats()]);
    } catch (err) {
      showError(`Failed to send notification: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Send notification to all employees
  const sendToAllEmployees = async () => {
    if (!message.trim()) {
      showError("Message is required");
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall("/notifications/send-to-employees", {
        method: "POST",
        body: JSON.stringify({
          message: message.trim(),
          type,
          priority,
          expiresAt: expiresAt || undefined,
        }),
      });

      showSuccess(result.message || "Notification sent to all employees!");
      resetForm();
      await Promise.all([fetchNotifications(currentPage), fetchStats()]);
    } catch (err) {
      showError(`Failed to send notification to employees: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Send notification to all team leads (Admin only)
  const sendToAllTeamLeads = async () => {
    if (!message.trim()) {
      showError("Message is required");
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall("/notifications/send-to-teamleads", {
        method: "POST",
        body: JSON.stringify({
          message: message.trim(),
          type,
          priority,
          expiresAt: expiresAt || undefined,
        }),
      });

      showSuccess(result.message || "Notification sent to all team leads!");
      resetForm();
      await Promise.all([fetchNotifications(currentPage), fetchStats()]);
    } catch (err) {
      showError(`Failed to send notification to team leads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Send notification to all users (Admin only)
  const sendToAllUsers = async () => {
    if (!message.trim()) {
      showError("Message is required");
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall("/notifications/send-to-all", {
        method: "POST",
        body: JSON.stringify({
          message: message.trim(),
          type,
          priority,
          expiresAt: expiresAt || undefined,
          excludeAdmins: false,
        }),
      });

      showSuccess(result.message || "Notification sent to all users!");
      resetForm();
      await Promise.all([fetchNotifications(currentPage), fetchStats()]);
    } catch (err) {
      showError(`Failed to send notification to all users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setMessage("");
    setSelectedUsers([]);
    setType("info");
    setPriority("normal");
    setExpiresAt("");
    setShowSendForm(false);
  };

  // Mark notification as read/unread
  const toggleNotificationStatus = async (id, action) => {
    try {
      const result = await apiCall(`/notifications/${id}/${action}`, {
        method: "PUT",
      });

      showSuccess(result.message || `Notification marked as ${action}`);
      await Promise.all([fetchNotifications(currentPage), fetchStats()]);
    } catch (err) {
      showError(`Failed to mark notification as ${action}: ${err.message}`);
    }
  };

  // Bulk mark as read
  const bulkMarkRead = async () => {
    if (selectedNotifications.length === 0) {
      showError("Please select notifications to mark as read");
      return;
    }

    try {
      const result = await apiCall("/notifications/bulk/mark-read", {
        method: "PUT",
        body: JSON.stringify({
          notificationIds: selectedNotifications,
        }),
      });

      showSuccess(result.message || `${selectedNotifications.length} notifications marked as read`);
      setSelectedNotifications([]);
      await Promise.all([fetchNotifications(currentPage), fetchStats()]);
    } catch (err) {
      showError(`Failed to mark notifications as read: ${err.message}`);
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      const result = await apiCall("/notifications/mark-all-read", {
        method: "PUT",
      });

      showSuccess(result.message || "All notifications marked as read");
      await Promise.all([fetchNotifications(currentPage), fetchStats()]);
    } catch (err) {
      showError(`Failed to mark all notifications as read: ${err.message}`);
    }
  };

  // Update notification
  const updateNotification = async () => {
    if (!editMessage.trim()) {
      showError("Message is required");
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall(`/notifications/${editingNotification._id}`, {
        method: "PUT",
        body: JSON.stringify({
          message: editMessage.trim(),
          type: editType,
          priority: editPriority,
        }),
      });

      showSuccess(result.message || "Notification updated successfully!");
      cancelEditing();
      await fetchNotifications(currentPage);
    } catch (err) {
      showError(`Failed to update notification: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const result = await apiCall(`/notifications/${id}`, {
        method: "DELETE",
      });

      showSuccess(result.message || "Notification deleted successfully!");
      await Promise.all([fetchNotifications(currentPage), fetchStats()]);
    } catch (err) {
      showError(`Failed to delete notification: ${err.message}`);
    }
  };

  // Handle user selection for sending notifications
  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle notification selection for bulk operations
  const handleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Select all notifications
  const selectAllNotifications = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  // Start editing notification
  const startEditing = (notification) => {
    setEditingNotification(notification);
    setEditMessage(notification.message);
    setEditType(notification.type);
    setEditPriority(notification.priority || "normal");
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingNotification(null);
    setEditMessage("");
    setEditType("info");
    setEditPriority("normal");
  };

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    const colors = {
      alert: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      task: 'bg-blue-100 text-blue-800 border-blue-200',
      report: 'bg-purple-100 text-purple-800 border-purple-200',
      info: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors.info;
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    const colors = {
      urgent: 'bg-red-200 text-red-900 border-red-300',
      high: 'bg-orange-200 text-orange-900 border-orange-300',
      normal: 'bg-green-200 text-green-900 border-green-300',
      low: 'bg-gray-200 text-gray-900 border-gray-300'
    };
    return colors[priority] || colors.normal;
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter change
  const handleFilterChange = (newFilter, newUnreadOnly = filterUnreadOnly) => {
    setFilterType(newFilter);
    setFilterUnreadOnly(newUnreadOnly);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Manage and send notifications</p>
          </div>
          <div className="flex gap-3">
            {stats?.unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Mark All Read ({stats.unreadCount})
              </button>
            )}
            <button
              onClick={() => fetchNotifications(currentPage)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 text-red-600 mt-0.5">⚠</div>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError("")} 
              className="text-red-600 hover:text-red-800 font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 text-green-600 mt-0.5">✓</div>
              <span>{success}</span>
            </div>
            <button 
              onClick={() => setSuccess("")} 
              className="text-green-600 hover:text-green-800 font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.unreadCount || stats.unread}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-green-600">{stats.read}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0}%
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Notification Form */}
        {canSendToUsers && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Send Notification</h2>
              <button
                onClick={() => setShowSendForm(!showSendForm)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {showSendForm ? 'Hide' : 'Show'} Form
              </button>
            </div>
            
            {showSendForm && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Message & Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter notification message..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows="4"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {notificationTypes.map(t => (
                            <option key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {priorities.map(p => (
                            <option key={p} value={p}>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expires At (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Right Column - Recipients */}
                  <div className="space-y-4">
                    {users.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Recipients ({selectedUsers.length} selected)
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                          <div className="mb-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedUsers.length === users.length) {
                                  setSelectedUsers([]);
                                } else {
                                  setSelectedUsers(users.map(u => u._id));
                                }
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {selectedUsers.length === users.length ? "Deselect All" : "Select All"}
                            </button>
                          </div>
                          {users.map(u => (
                            <label key={u._id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(u._id)}
                                onChange={() => handleUserSelection(u._id)}
                                className="mr-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {u.name || u.username}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">({u.role})</span>
                                {u.email && <div className="text-xs text-gray-500">{u.email}</div>}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Send Buttons */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Quick Send Options:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={sendNotificationToUsers}
                          disabled={loading || !message.trim() || selectedUsers.length === 0}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {loading ? "Sending..." : `Send to Selected (${selectedUsers.length})`}
                        </button>

                        {canSendToAll && (
                          <button
                            onClick={sendToAllEmployees}
                            disabled={loading || !message.trim()}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            {loading ? "Sending..." : "Send to All Employees"}
                          </button>
                        )}

                        {isAdmin && (
                          <>
                            <button
                              onClick={sendToAllTeamLeads}
                              disabled={loading || !message.trim()}
                              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                              {loading ? "Sending..." : "Send to All Team Leads"}
                            </button>
                            <button
                              onClick={sendToAllUsers}
                              disabled={loading || !message.trim()}
                              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                              {loading ? "Sending..." : "Send to All Users"}
                            </button>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={resetForm}
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        Clear Form
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters and Bulk Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {notificationTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="unreadOnly"
                  checked={filterUnreadOnly}
                  onChange={(e) => handleFilterChange(filterType, e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="unreadOnly" className="text-sm font-medium text-gray-700">
                  Show only unread
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedNotifications.length > 0 && (
                <button
                  onClick={bulkMarkRead}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Mark Selected Read ({selectedNotifications.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Notification Modal */}
        {editingNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Edit Notification</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {notificationTypes.map(t => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {priorities.map(p => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={updateNotification}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {isAdmin ? "All Notifications" : "My Notifications"} 
                <span className="ml-2 text-sm font-normal text-gray-500">({notifications.length})</span>
              </h3>
              
              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                    onChange={selectAllNotifications}
                    className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Select All
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification._id} className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}>
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleNotificationSelection(notification._id)}
                        className="mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          
                          {notification.priority && notification.priority !== 'normal' && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadgeColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          )}
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.isRead ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'
                          }`}>
                            {notification.isRead ? 'Read' : 'Unread'}
                          </span>

                          {notification.expiresAt && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200">
                              Expires: {new Date(notification.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-900 font-medium mb-2 break-words">
                          {notification.message}
                        </p>
                        
                        <div className="text-sm text-gray-500 space-y-1">
                          {notification.sender && (
                            <p className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">From:</span>
                              <span>{notification.sender.name || notification.sender.username}</span>
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                                {notification.sender.role}
                              </span>
                            </p>
                          )}
                          
                          {isAdmin && notification.receivers && (
                            <p className="flex items-start gap-2">
                              <span className="font-medium">Recipients:</span>
                              <span>
                                {notification.receivers.length} user(s)
                                {notification.receivers.length <= 3 && (
                                  <span className="ml-1">
                                    ({notification.receivers.map(r => r.name || r.username).join(', ')})
                                  </span>
                                )}
                              </span>
                            </p>
                          )}
                          
                          <p className="flex items-center gap-4 text-xs">
                            <span>
                              <span className="font-medium">Created:</span> {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            {notification.updatedAt && notification.updatedAt !== notification.createdAt && (
                              <span>
                                <span className="font-medium">Updated:</span> {new Date(notification.updatedAt).toLocaleString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => toggleNotificationStatus(notification._id, notification.isRead ? 'unread' : 'read')}
                          className={`px-3 py-1 text-xs rounded transition-colors font-medium ${
                            notification.isRead 
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                          }`}
                        >
                          Mark {notification.isRead ? 'Unread' : 'Read'}
                        </button>
                        
                        {(isAdmin || notification.sender?._id === user?._id) && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditing(notification)}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors border border-blue-200 font-medium"
                              title="Edit notification"
                            >
                              Edit
                            </button>
                            
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors border border-red-200 font-medium"
                              title="Delete notification"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 4.5L15 8v7H5V8l5-3.5z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500">
                  {filterType !== 'all' || filterUnreadOnly 
                    ? "Try adjusting your filters to see more notifications."
                    : "You'll see notifications here when they arrive."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.current} of {pagination.pages} 
                  <span className="ml-2 text-gray-500">
                    ({pagination.total} total notifications)
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let page = i + 1;
                      
                      // Smart pagination for large page counts
                      if (pagination.pages > 5) {
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(pagination.pages, start + 4);
                        page = start + i;
                        
                        if (page > end) return null;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm rounded font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, pagination.pages))}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role-based Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Your Role Permissions:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            {user?.role === "admin" && (
              <>
                <p>• View and manage ALL notifications across the system</p>
                <p>• Send notifications to specific users, employees, team leads, or all users</p>
                <p>• Edit and delete any notification</p>
                <p>• Access advanced filtering and bulk operations</p>
              </>
            )}
            {user?.role === "teamlead" && (
              <>
                <p>• View notifications sent to you</p>
                <p>• Send notifications to employees and admins</p>
                <p>• Send bulk notifications to all employees</p>
                <p>• Edit and delete your own notifications</p>
              </>
            )}
            {user?.role === "employee" && (
              <>
                <p>• View notifications sent to you</p>
                <p>• Send notifications to team leads and admins</p>
                <p>• Mark notifications as read/unread</p>
                <p>• Edit and delete your own notifications</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;