import React, { useEffect, useState, useRef } from "react";
import PageHeader from "../components/utils/PageHeader";
import UserModal from "../components/usermodel/UserModal";
import $ from "jquery";
import "datatables.net-dt";
import SummaryApi from "../common/Summaryapi";
import Axios from "../utils/axios";
import "../pages/style/dashboard.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Users = () => {
  const tableRef = useRef();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState({
    first_name: null,
    last_name: null,
    job_title: null,
    business_mobile_number: null,
    personal_mobile: null,
    personal_email: null,
    user_type: null,
    company_name: null,
    company_phone_number: null,
    company_url: null,
    address_1: null,
    address_2: null,
    address_3: null,
    city: null,
    state: null,
    zip_code: null,
    country_region: null,
    profile_id: null
  });
  const [tableKey, setTableKey] = useState(0);

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await Axios({ ...SummaryApi.get_users });
      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && tableRef.current) {
      const table = $(tableRef.current).DataTable({
        data: users,
        columns: [
          { 
            title: '<div class="th-content">Full Name</div>', 
            data: "full_name",
            className: "user-name-cell",
          },
          { 
            title: '<div class="th-content">Mobile</div>', 
            data: "personal_mobile",
            className: "data-cell",
            render: (data) => data || '<span class="no-data">-</span>'
          },
          { 
            title: '<div class="th-content">Email</div>', 
            data: "personal_email",
            className: "data-cell email-cell",
            render: (data) => data || '<span class="no-data">-</span>'
          },
          { 
            title: '<div class="th-content">Company Name</div>', 
            data: "company_name",
            className: "data-cell",
            render: (data) => data || '<span class="no-data">-</span>'
          },
          { 
            title: '<div class="th-content">Company URL</div>', 
            data: "company_url",
            className: "data-cell",
            render: (data) => data || '<span class="no-data">-</span>'
          },
          { 
            title: '<div class="th-content">User Type</div>', 
            data: "user_type",
            className: "data-cell",
            render: (data) => {
              if (!data) return '<span class="no-data">-</span>';
              const badgeClass = 
                data === 'admin' ? 'bg-purple-100 text-purple-800' :
                data === 'leader' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800';
              return `<span class="px-2 py-1 text-xs rounded-full ${badgeClass}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`;
            }
          },
          {
            title: '<div class="th-content">Status</div>',
            data: null,
            className: "status-cell",
            render: (data, type, row) => {
              const statusValue = row.status === "Approved" ? 1 : 0;
              const passwordSent = row.password_sent_status === "Y";
              console.log(row);
              return `
                <div class="status-container flex items-center">
                  <select class="status-select" data-profile-id="${row.profile_id}">
                    <option value="1" ${statusValue === 1 ? 'selected' : ''}>Approved</option>
                    <option value="0" ${statusValue === 0 ? 'selected' : ''}>Not Approved</option>
                  </select>
                  ${passwordSent ? 
                    '<span class="password-sent ml-2" title="Password already sent">✓</span>' : 
                    '<span class="password-not-sent ml-2" title="Password not sent">✗</span>'
                  }
                </div>
              `;
            },
          },
          {
            title: '<div class="th-content">Actions</div>',
            data: null,
            orderable: false,
            className: "action-cell",
            render: (data, type, row) => `
              <div class="action-buttons flex space-x-2">
                <button onclick="handleActionDropdown('view', '${row.profile_id}')" 
                        class="btn-action btn-view p-2 rounded hover:bg-blue-100 text-blue-600" 
                        title="View">
                  ${getIconSvg('view')}
                </button>
                <button onclick="handleActionDropdown('edit', '${row.profile_id}')" 
                        class="btn-action btn-edit p-2 rounded hover:bg-yellow-100 text-yellow-600" 
                        title="Edit">
                  ${getIconSvg('edit')}
                </button>
                <button onclick="handleActionDropdown('delete', '${row.profile_id}')" 
                        class="btn-action btn-delete p-2 rounded hover:bg-red-100 text-red-600" 
                        title="Delete">
                  ${getIconSvg('delete')}
                </button>
              </div>
            `,
          },
        ],
        order: [],
        responsive: false,
        scrollX: true,
        scrollY: "calc(100vh - 340px)",
        scrollCollapse: true,
        paging: true,
        pageLength: 10,
        lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
        dom: '<"datatable-top"<"dt-left"l><"dt-right"f>>t<"datatable-bottom"<"dt-info"i><"dt-pagination"p>>',
        destroy: true,
        language: {
          search: "",
          searchPlaceholder: "Search users...",
          lengthMenu: "Show _MENU_",
          info: "Showing _START_ to _END_ of _TOTAL_ users",
          paginate: {
            first: '«',
            last: '»',
            next: '›',
            previous: '‹'
          }
        },
        initComplete: function() {
          $('.dt-right').prepend('<span class="search-icon">🔍</span>');
        }
      });

      // Status dropdown change handler
      $(tableRef.current).on('change', '.status-select', async function() {
        const profileId = $(this).data('profile-id');
        const active = $(this).val() === '1' ? true : false;
        
        try {
          await updateUserStatus(profileId, active);
          await getUsers();
        } catch (err) {
          console.error("Status update failed:", err);
          alert("Failed to update status. Please try again.");
        }
      });

      return () => {
        table.destroy();
      };
    }
  }, [users, tableKey]);

  // Update user status
  const updateUserStatus = async (profileId, active) => {
    try {
      await Axios({
        url: `/users/${profileId}/status`,
        method: "PUT",
        data: { active }
      });
    } catch (err) {
      throw err;
    }
  };

  const getIconSvg = (type) => {
    switch(type) {
      case 'view':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>`;
      case 'edit':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>`;
      case 'delete':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>`;
      default:
        return '';
    }
  };

  const mapBackendToFrontend = (backendData) => {
    return {
      user_type: backendData.user_type || null,
      first_name: backendData.first_name || null,
      last_name: backendData.last_name || null,
      job_title: backendData.job_title || null,
      business_mobile_number: backendData.business_mobile_number || null,
      personal_mobile: backendData.personal_mobile || null,
      personal_email: backendData.personal_email || null,
      company_name: backendData.company_name || null,
      company_phone_number: backendData.company_phone_number || null,
      company_url: backendData.company_url || null,
      address_1: backendData.address_1 || null,
      address_2: backendData.address_2 || null,
      address_3: backendData.address_3 || null,
      city: backendData.city || null,
      state: backendData.state || null,
      zip_code: backendData.zip_code || null,
      country_region: backendData.country_region || null,
      profile_id: backendData.profile_id || null,
      password_sent: backendData.password_sent || null
    };
  };

  const mapFrontendToBackend = (frontendData) => {
    return {
      first_name: frontendData.first_name || null,
      last_name: frontendData.last_name || null,
      job_title: frontendData.job_title || null,
      business_mobile_number: frontendData.business_mobile_number || null,
      personal_mobile: frontendData.personal_mobile || null,
      personal_email: frontendData.personal_email || null,
      user_type: frontendData.user_type || null,
      company_name: frontendData.company_name || null,
      company_phone_number: frontendData.company_phone_number || null,
      company_url: frontendData.company_url || null,
      address_1: frontendData.address_1 || null,
      address_2: frontendData.address_2 || null,
      address_3: frontendData.address_3 || null,
      city: frontendData.city || null,
      state: frontendData.state || null,
      zip_code: frontendData.zip_code || null,
      country_region: frontendData.country_region || null,
    };
  };

  useEffect(() => {
    window.handleActionDropdown = async (action, profileId) => {
      if (!profileId) return;

      if (action === "view" || action === "edit") {
        try {
          const res = await Axios({
            url: `/users/${profileId}`,
            method: "GET",
          });

          const mappedData = mapBackendToFrontend(res.data);
          setSelectedUser(mappedData);
          setModalMode(action);
          setModalOpen(true);
        } catch (err) {
          console.error("Fetch single user failed:", err);
        }
      } else if (action === "delete") {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (confirmDelete) {
          try {
            await Axios({
              url: `/users/${profileId}`,
              method: "DELETE",
            });
            alert("User deleted successfully");
            setTableKey(prev => prev + 1);
            await getUsers();
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Delete failed. Please try again.");
          }
        }
      }
    };
  }, []);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = mapFrontendToBackend(selectedUser);

      if (modalMode === "edit") {
        await Axios({
          url: `/users/${selectedUser.profile_id}`,
          method: "PUT",
          data: payload,
        });
        alert("User updated successfully!");
      } else if (modalMode === "create") {
        const response = await Axios({
          url: `/create_user`,
          method: "POST",
          data: payload,
        });
        alert("User created successfully!");
      }

      setModalOpen(false);
      setTableKey(prev => prev + 1);
      await getUsers();
    } catch (err) {
      console.error(modalMode === "create" ? "Create failed:" : "Update failed:", err);
      alert(`${modalMode === "create" ? "Create" : "Update"} failed. Please try again.`);
    }
  };

  return (
    <div className="users-container">
      <PageHeader title="Users" />
      
      <div className="users-card">
        <div className="card-header">
          <div className="header-left">
            <h2 className="card-title">User Management</h2>
          </div>
          <div className="header-right flex items-center">
            <div className="stats-badge mr-4">
              <span className="stats-number">{users.length}</span> Users
            </div>
            <button
              onClick={() => {
                setModalMode("create");
                setSelectedUser({
                  first_name: null,
                  last_name: null,
                  job_title: null,
                  business_mobile_number: null,
                  personal_mobile: null,
                  personal_email: null,
                  user_type: null,
                  company_name: null,
                  company_phone_number: null,
                  company_url: null,
                  address_1: null,
                  address_2: null,
                  address_3: null,
                  city: null,
                  state: null,
                  zip_code: null,
                  country_region: null,
                  profile_id: null
                });
                setModalOpen(true);
              }}
              className="btn-add-new flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New User
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loader">
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
            </div>
            <p className="loading-text">Loading users data...</p>
          </div>
        ) : (
          <div key={tableKey} className="table-container">
            <table ref={tableRef} className="users-table" />
          </div>
        )}
      </div>

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        formData={selectedUser}
        setFormData={setSelectedUser}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default Users;