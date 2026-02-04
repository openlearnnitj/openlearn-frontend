import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Eye, 
  Linkedin,
  Github,
  BarChart3,
  ExternalLink,
  Calendar,
  Mail,
  Shield,
  Star,
  Crown,
  Sparkles,
  ChevronDown,
  Loader2,
  Hash,
  MessageCircle,
  Globe,
  Database,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { getUserAvatarUrl } from '../../../utils/helpers/boringAvatarsUtils';
import LeagueSelectionModal from './LeagueSelectionModal';

// Modal component that renders to document.body for proper centering
const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[10000]"
      onClick={handleOverlayClick}
    >
      {children}
    </div>,
    document.body
  );
};

const UserManagement = ({ 
  users, 
  onApproveUser, 
  onUpdateRole, 
  onUpdateStatus,
  onPromoteWithLeagues,
  availableLeagues = [],
  loading
}) => {
  const [selectedRole, setSelectedRole] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [migrationFilter, setMigrationFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [userDetailModal, setUserDetailModal] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // League assignment modal state
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState(null);
  const [leagues] = useState(availableLeagues);
  const [promotionLoading, setPromotionLoading] = useState(false);
  
  const handleRoleChange = (userId, role) => {
    setSelectedRole({
      ...selectedRole,
      [userId]: role
    });
  };
  
  const handleUpdateRole = (userId) => {
    const newRole = selectedRole[userId];
    if (newRole) {
      onUpdateRole(userId, newRole);
      // Clear the selected role after update
      setSelectedRole({
        ...selectedRole,
        [userId]: undefined
      });
    }
  };

  const handlePromoteToPathfinder = (user, role) => {
    setSelectedUser(user);
    setTargetRole(role);
    setShowLeagueModal(true);
  };

  const handleLeagueAssignment = async (userId, role, leagueAssignments) => {
    try {
      setPromotionLoading(true);
      console.log('Promoting user:', userId, 'to role:', role, 'with leagues:', leagueAssignments);
      await onPromoteWithLeagues?.(userId, role, leagueAssignments);
      setShowLeagueModal(false);
      setSelectedUser(null);
      setTargetRole(null);
    } catch (error) {
      console.error('Error promoting user with leagues:', error);
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Enhanced filter and search logic
  const filteredAndSortedUsers = users
    .filter(user => {
      // Never show GRAND_PATHFINDER users in the list
      if (user.role === 'GRAND_PATHFINDER') return false;
      if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;
      if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
      
      // Migration filter
      if (migrationFilter !== 'ALL') {
        if (migrationFilter === 'MIGRATED' && user.migratedToV2 !== true) return false;
        if (migrationFilter === 'NOT_MIGRATED' && user.migratedToV2 === true) return false;
      }
      
      // Search functionality
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.twitterHandle?.toLowerCase().includes(searchLower) ||
          user.githubUsername?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === 'name') {
        aValue = a.name || '';
        bValue = b.name || '';
      } else if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortBy === 'olid') {
        aValue = a.olid || '';
        bValue = b.olid || '';
      }
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Use filtered and sorted users
  const filteredUsers = filteredAndSortedUsers;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter, migrationFilter, searchTerm, sortBy, sortDirection]);
  
  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Get user counts by status (excluding GRAND_PATHFINDER users)
  const eligibleUsers = users.filter(u => u.role !== 'GRAND_PATHFINDER');
  const userCounts = {
    total: eligibleUsers.length,
    active: eligibleUsers.filter(u => u.status === 'ACTIVE').length,
    pending: eligibleUsers.filter(u => u.status === 'PENDING').length,
    suspended: eligibleUsers.filter(u => u.status === 'SUSPENDED').length,
    migrated: eligibleUsers.filter(u => u.migratedToV2 === true).length,
    notMigrated: eligibleUsers.filter(u => u.migratedToV2 !== true).length
  };

  // Role display helper
  const getRoleInfo = (role) => {
    switch (role) {
      case 'PIONEER':
        return { icon: Star, label: 'Pioneer', color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'LUMINARY':
        return { icon: Sparkles, label: 'Luminary', color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'PATHFINDER':
        return { icon: Shield, label: 'Pathfinder', color: 'text-green-600 bg-green-50 border-green-200' };
      case 'CHIEF_PATHFINDER':
        return { icon: Crown, label: 'Chief Pathfinder', color: 'text-orange-600 bg-orange-50 border-orange-200' };
      case 'GRAND_PATHFINDER':
        return { icon: Crown, label: 'Grand Pathfinder', color: 'text-red-600 bg-red-50 border-red-200' };
      default:
        return { icon: Users, label: role, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };
  
  if (eligibleUsers.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-500">No users have been registered yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">User Management</h3>
              <p className="text-gray-600">
                Manage user roles, status, and permissions across the platform
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">{userCounts.active} Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-700">{userCounts.pending} Pending</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-700">{userCounts.suspended} Suspended</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <ArrowUpCircle size={14} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  {userCounts.migrated} Migrated 
                  <span className="text-xs text-blue-600 ml-1">
                    ({userCounts.total > 0 ? Math.round((userCounts.migrated / userCounts.total) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Users size={14} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{userCounts.total} Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Filters and Search */}
        <div className="p-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or social handles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text text-sm"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm cursor-pointer transition-colors"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm cursor-pointer transition-colors"
              >
                <option value="ALL">All Roles</option>
                <option value="PIONEER">Pioneer</option>
                <option value="PATHFINDER">Pathfinder</option>
                <option value="CHIEF_PATHFINDER">Chief Pathfinder</option>
                <option value="LUMINARY">Luminary</option>
              </select>

              <select
                value={migrationFilter}
                onChange={(e) => setMigrationFilter(e.target.value)}
                className="px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm cursor-pointer transition-colors"
              >
                <option value="ALL">All Migration</option>
                <option value="MIGRATED">Migrated to V2</option>
                <option value="NOT_MIGRATED">Not Migrated</option>
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setRoleFilter('ALL');
                  setMigrationFilter('ALL');
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> users
              {filteredUsers.length !== eligibleUsers.length && (
                <span className="text-gray-500"> (filtered from {eligibleUsers.length})</span>
              )}
            </p>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header with Sorting */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    User Details
                    <ChevronDown size={14} className={`transition-transform ${sortBy === 'name' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('olid')}
                >
                  <div className="flex items-center gap-1">
                    OL ID
                    <ChevronDown size={14} className={`transition-transform ${sortBy === 'olid' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Joined
                    <ChevronDown size={14} className={`transition-transform ${sortBy === 'createdAt' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-3" />
                      <span className="text-gray-500">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No users found matching your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  const RoleIcon = roleInfo.icon;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* User Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center cursor-pointer" onClick={() => setUserDetailModal(user)}>
                          <div className="flex-shrink-0 h-12 w-12 relative">
                            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <img
                                src={getUserAvatarUrl(user, 'avataaars', 48)}
                                alt={`${user.name} avatar`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallbackDiv = e.target.nextSibling;
                                  if (fallbackDiv) {
                                    fallbackDiv.style.display = 'flex';
                                  }
                                }}
                                onLoad={(e) => {
                                  const fallbackDiv = e.target.nextSibling;
                                  if (fallbackDiv) {
                                    fallbackDiv.style.display = 'none';
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700 rounded-full" style={{ display: 'none' }}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            </div>
                            {/* Online Status Indicator */}
                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${user.status === 'ACTIVE' ? 'bg-green-400' : 'bg-gray-400'} shadow-sm`}></div>
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                                {user.name}
                              </p>
                              {user.status === 'ACTIVE' && (
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail size={12} className="text-gray-400" />
                              <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {/* Role Selector */}
                          <div className="flex items-center gap-2">
                            <select 
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors bg-white"
                              value={selectedRole[user.id] || user.role}
                              onChange={(e) => {
                                const newRole = e.target.value;
                                // Check if promoting to Pathfinder roles
                                if ((newRole === 'PATHFINDER' || newRole === 'CHIEF_PATHFINDER') && 
                                    user.role !== 'PATHFINDER' && user.role !== 'CHIEF_PATHFINDER') {
                                  // Open league selection modal
                                  handlePromoteToPathfinder(user, newRole);
                                } else {
                                  // Standard role change
                                  handleRoleChange(user.id, newRole);
                                }
                              }}
                              disabled={user.status !== 'ACTIVE'}
                            >
                              <option value="PIONEER">Pioneer</option>
                              <option value="PATHFINDER">Pathfinder</option>
                              <option value="CHIEF_PATHFINDER">Chief Pathfinder</option>
                              <option value="LUMINARY">Luminary</option>
                            </select>
                            {selectedRole[user.id] && selectedRole[user.id] !== user.role && 
                             selectedRole[user.id] !== 'PATHFINDER' && selectedRole[user.id] !== 'CHIEF_PATHFINDER' && (
                              <button 
                                onClick={() => handleUpdateRole(user.id)}
                                className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer font-medium shadow-sm"
                              >
                                Update
                              </button>
                            )}
                          </div>
                          
                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                              user.status === 'ACTIVE' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : user.status === 'PENDING'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              <RoleIcon size={12} />
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* OL ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{user.olid || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          <span>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.status === 'PENDING' && (
                            <button 
                              onClick={() => onApproveUser(user.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer shadow-sm"
                            >
                              <UserCheck size={12} />
                              Approve
                            </button>
                          )}
                          
                          {user.status !== 'PENDING' && (
                            <button 
                              onClick={() => onUpdateStatus(
                                user.id, 
                                user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                              )}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm ${
                                user.status === 'ACTIVE' 
                                  ? 'text-white bg-red-600 hover:bg-red-700' 
                                  : 'text-white bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {user.status === 'ACTIVE' ? (
                                <>
                                  <UserX size={12} />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <UserCheck size={12} />
                                  Activate
                                </>
                              )}
                            </button>
                          )}
                          
                          {/* More Actions Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setUserDetailModal(user)}
                              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredUsers.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page info */}
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              
              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                {/* First page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                
                {/* Previous page */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white font-medium'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                {/* Next page */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                
                {/* Last page */}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
              
              {/* Jump to page */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Go to:</label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      goToPage(page);
                    }
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-center"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {userDetailModal && (
        <Modal isOpen={true} onClose={() => setUserDetailModal(null)}>
          <UserDetailModal 
            user={userDetailModal} 
            onClose={() => setUserDetailModal(null)}
            onUpdateStatus={onUpdateStatus}
            onApproveUser={onApproveUser}
          />
        </Modal>
      )}

      {/* League Selection Modal */}
      {showLeagueModal && (
        <Modal isOpen={true} onClose={() => setShowLeagueModal(false)}>
          <LeagueSelectionModal
            user={selectedUser}
            targetRole={targetRole}
            leagues={leagues}
            loading={promotionLoading}
            onConfirm={handleLeagueAssignment}
            onCancel={() => setShowLeagueModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ user, onClose, onUpdateStatus, onApproveUser }) => {
  const getRoleInfo = (role) => {
    switch (role) {
      case 'PIONEER':
        return { icon: Star, label: 'Pioneer', color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'LUMINARY':
        return { icon: Sparkles, label: 'Luminary', color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'PATHFINDER':
        return { icon: Shield, label: 'Pathfinder', color: 'text-green-600 bg-green-50 border-green-200' };
      case 'CHIEF_PATHFINDER':
        return { icon: Crown, label: 'Chief Pathfinder', color: 'text-orange-600 bg-orange-50 border-orange-200' };
      case 'GRAND_PATHFINDER':
        return { icon: Crown, label: 'Grand Pathfinder', color: 'text-red-600 bg-red-50 border-red-200' };
      default:
        return { icon: Users, label: role, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
              <img
                src={getUserAvatarUrl(user, 'avataaars', 64)}
                alt={`${user.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* User Status & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                    user.status === 'ACTIVE' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : user.status === 'PENDING'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-500' : 
                      user.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    {user.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${roleInfo.color}`}>
                    <RoleIcon size={12} />
                    {roleInfo.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">OpenLearn ID</span>
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{user.olid}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                  user.emailVerified 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    user.emailVerified ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {user.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              {user.migratedToV2 !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">V2 Migration</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                    user.migratedToV2 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      user.migratedToV2 ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    {user.migratedToV2 ? 'Migrated' : 'Not Migrated'}
                  </span>
                </div>
              )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
              
              <div className="space-y-3">
                {user.institute && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Institute</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-48 break-words">
                      {user.institute}
                    </span>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-48 break-words">
                      {user.department}
                    </span>
                  </div>
                )}

                {user.graduationYear && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Graduation Year</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.graduationYear}
                    </span>
                  </div>
                )}

                {user.studentId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Student ID</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.studentId}
                    </span>
                  </div>
                )}

                {user.currentCohort && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Cohort</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                      user.currentCohort.isActive 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        user.currentCohort.isActive ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                      {user.currentCohort.name}
                    </span>
                  </div>
                )}

                {user.phoneNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phone Number</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.phoneNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Additional Social Profiles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Additional Profiles</h3>
              
              <div className="space-y-3">
                {user.discordUsername ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <MessageCircle size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Discord</p>
                        <p className="text-xs text-gray-600">{user.discordUsername}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center">
                        <MessageCircle size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Discord</p>
                        <p className="text-xs text-gray-500">Not connected</p>
                      </div>
                    </div>
                  </div>
                )}

                {user.portfolioUrl ? (
                  <a
                    href={user.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                        <Globe size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Portfolio</p>
                        <p className="text-xs text-gray-600">Personal website</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-purple-600" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center">
                        <Globe size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Portfolio</p>
                        <p className="text-xs text-gray-500">Not provided</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </span>
                </div>

                {user.approvedBy && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approved By</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.approvedBy}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Profiles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Social Profiles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.twitterHandle ? (
                  <a
                    href={`https://x.com/${user.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <FaXTwitter size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">X (Twitter)</p>
                        <p className="text-xs text-gray-600">@{user.twitterHandle}</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center">
                        <FaXTwitter size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">X (Twitter)</p>
                        <p className="text-xs text-gray-500">Not connected</p>
                      </div>
                    </div>
                  </div>
                )}

                {user.linkedinUrl ? (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Linkedin size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                        <p className="text-xs text-gray-600">Professional profile</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center">
                        <Linkedin size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                        <p className="text-xs text-gray-500">Not connected</p>
                      </div>
                    </div>
                  </div>
                )}

                {user.githubUsername ? (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                        <Github size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">GitHub</p>
                        <p className="text-xs text-gray-600">@{user.githubUsername}</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center">
                        <Github size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">GitHub</p>
                        <p className="text-xs text-gray-500">Not connected</p>
                      </div>
                    </div>
                  </div>
                )}

                {user.kaggleUsername ? (
                  <a
                    href={`https://kaggle.com/${user.kaggleUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                        <BarChart3 size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Kaggle</p>
                        <p className="text-xs text-gray-600">{user.kaggleUsername}</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-cyan-600" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center">
                        <BarChart3 size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Kaggle</p>
                        <p className="text-xs text-gray-500">Not connected</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            {user.status === 'PENDING' && (
              <button 
                onClick={() => {
                  onApproveUser?.(user.id);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer"
              >
                <UserCheck size={16} />
                Approve User
              </button>
            )}
            
            {user.status !== 'PENDING' && (
              <button 
                onClick={() => {
                  onUpdateStatus?.(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                  onClose();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  user.status === 'ACTIVE' 
                    ? 'text-white bg-red-600 hover:bg-red-700' 
                    : 'text-white bg-green-600 hover:bg-green-700'
                }`}
              >
                {user.status === 'ACTIVE' ? (
                  <>
                    <UserX size={16} />
                    Suspend User
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    Activate User
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
    </div>
  );
};

export default UserManagement;
