'use client';

import React, { useState } from 'react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  branch: string;
  email: string;
  status: 'Active' | 'Invited' | 'Revoked';
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { id: '1', name: 'Admin User', role: 'Owner', branch: 'All Branches', email: 'admin@restaurant.com', status: 'Active' },
    { id: '2', name: 'Manager 1', role: 'Branch Manager', branch: 'Central Branch', email: 'manager@restaurant.com', status: 'Active' },
    { id: '3', name: 'Cashier 2', role: 'Cashier', branch: 'DHA Phase 5', email: 'cashier@restaurant.com', status: 'Invited' },
    { id: '4', name: 'Kitchen Head', role: 'Kitchen Staff', branch: 'Central Branch', email: 'chef@restaurant.com', status: 'Active' },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({ name: '', role: 'Branch Manager', branch: 'Central Branch', email: '' });
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s));
      showToast(`Updated staff member "${formData.name}"`);
      setEditingStaff(null);
    } else {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        branch: formData.branch,
        status: 'Invited'
      };
      setStaffList(prev => [...prev, newStaff]);
      showToast(`Invitation sent to ${formData.email}!`);
    }

    setFormData({ name: '', role: 'Branch Manager', branch: 'Central Branch', email: '' });
    setShowInviteModal(false);
  };

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke access for ${name}?`)) {
      setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: 'Revoked' } : s));
      showToast(`Revoked access for ${name}`);
    }
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({ name: staff.name, role: staff.role, branch: staff.branch, email: staff.email });
    setShowInviteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium border border-gray-700 animate-fade-in">
          ✓ {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members, roles, and branch assignments.</p>
        </div>
        <button 
          onClick={() => {
            setEditingStaff(null);
            setFormData({ name: '', role: 'Branch Manager', branch: 'Central Branch', email: '' });
            setShowInviteModal(true);
          }}
          className="px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <span>+ Invite Staff</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name & Email</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Branch</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffList.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{staff.name}</div>
                  <div className="text-xs text-gray-500">{staff.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {staff.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {staff.branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                    staff.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : staff.status === 'Invited' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {staff.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button 
                    onClick={() => handleEdit(staff)}
                    className="text-blue-600 hover:text-blue-900 font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                  {staff.status !== 'Revoked' && (
                    <button 
                      onClick={() => handleRevoke(staff.id, staff.name)}
                      className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite / Edit Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingStaff ? 'Edit Staff Member' : 'Invite New Staff'}
              </h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sara Ahmed"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="sara@restaurant.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Kitchen Staff">Kitchen Staff</option>
                  <option value="Rider Coordinator">Rider Coordinator</option>
                  <option value="Owner">Owner / SuperAdmin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Assigned Branch</label>
                <select 
                  value={formData.branch}
                  onChange={e => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Central Branch">Central Branch</option>
                  <option value="DHA Phase 5">DHA Phase 5</option>
                  <option value="Gulberg Branch">Gulberg Branch</option>
                  <option value="All Branches">All Branches (Global)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button 
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  {editingStaff ? 'Save Changes' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
