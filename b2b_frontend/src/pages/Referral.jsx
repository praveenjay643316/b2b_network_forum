import React, { useState, useEffect, useRef } from "react";
import PageHeader from "../components/utils/PageHeader";
import $ from "jquery";
import "datatables.net-dt";
import Axios from "../utils/axios";
import SummaryApi from "../common/Summaryapi";
import { toast } from "react-toastify";

const Referral = () => {
  const tableRef = useRef();
  const [loading, setLoading] = useState(false);
  const [referralList, setReferralList] = useState([]);
  const [users, setUsers] = useState([]);
  const [tableKey, setTableKey] = useState(0);
  const [showForm, setShowForm] = useState(true); // Default to true to show form by default
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    to_profile_id: "",
    lead_type: "",
    referral_type: "",
    referral_status: "",
    address: "",
    mobile_number: "",
    email: "",
    comments: ""
  });

  const [errors, setErrors] = useState({});

  // Fetch Referral list
  const fetchReferralList = async () => {
    setLoading(true);
    try {
      const response = await Axios(SummaryApi.referral_list);
      if (response.data.success) {
        setReferralList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching Referral list:", error);
      toast.error("Failed to load referral entries");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await Axios(SummaryApi.referral_users);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchReferralList();
    fetchUsers();
  }, []);

  // Initialize DataTable
  useEffect(() => {
    if (tableRef.current) {
      // Destroy existing table if it exists
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      const table = $(tableRef.current).DataTable({
        data: referralList,
        columns: [
          { 
            title: "Referred To", 
            data: "to_name",
            className: "font-medium",
            defaultContent: "-"
          },
          { 
            title: "Lead Type", 
            data: "lead_type",
            render: (data) => {
              if (!data) return '-';
              const badgeClass = data === 'HOT' 
                ? 'badge-hot'
                : data === 'WARM' 
                ? 'badge-warm' 
                : 'badge-cold';
              return `<span class="${badgeClass}">${data}</span>`;
            },
            defaultContent: "-"
          },
          { 
            title: "Referral Type", 
            data: "referral_type",
            render: (data) => {
              if (!data) return '-';
              const badge = data === 'inside' 
                ? '<span class="badge-inside">Inside</span>'
                : '<span class="badge-outside">Outside</span>';
              return badge;
            },
            defaultContent: "-"
          },
          { 
            title: "Status", 
            data: "referral_status",
            render: (data) => {
              if (!data) return '-';
              const badge = data === 'given_card' 
                ? '<span class="badge-given-card">Given Card</span>'
                : '<span class="badge-told-call">Told Will Call</span>';
              return badge;
            },
            defaultContent: "-"
          },
          { 
            title: "Mobile", 
            data: "mobile_number",
            render: (data) => data || '-',
            defaultContent: "-"
          },
          { 
            title: "Email", 
            data: "email",
            render: (data) => data || '-',
            defaultContent: "-"
          },
          { 
            title: "Address", 
            data: "address",
            render: (data) => data ? (data.length > 50 ? data.substring(0, 50) + '...' : data) : '-',
            defaultContent: "-"
          },
          { 
            title: "Comments", 
            data: "comments",
            render: (data) => data ? (data.length > 30 ? data.substring(0, 30) + '...' : data) : '-',
            defaultContent: "-"
          },
          { 
            title: "Created Date", 
            data: "created_at",
            defaultContent: "-"
          },
          {
            title: "Actions",
            data: null,
            orderable: false,
            className: "action-cell",
            render: (data, type, row) => {
              if (!row.referral_id) return '-';
              return `
                <div class="action-buttons">
                  <button onclick="handleEdit('${row.referral_id}')" class="btn-action btn-edit">Edit</button>
                  <button onclick="handleDelete('${row.referral_id}')" class="btn-action btn-delete">Delete</button>
                </div>
              `;
            },
            defaultContent: "-"
          },
        ],
        responsive: false,
        scrollX: true,
        scrollY: "calc(100vh - 400px)",
        scrollCollapse: true,
        paging: true,
        pageLength: 10,
        dom: '<"datatable-top"<"dt-left"l><"dt-right"f>>t<"datatable-bottom"<"dt-info"i><"dt-pagination"p>>',
        destroy: true,
        language: {
          search: "",
          searchPlaceholder: "Search referrals...",
          lengthMenu: "Show _MENU_",
          info: "Showing _START_ to _END_ of _TOTAL_ entries",
          emptyTable: "No referral entries found",
          zeroRecords: "No matching referrals found"
        },
        initComplete: function() {
          $('.dt-right').prepend('<span class="search-icon">🔍</span>');
        }
      });

      return () => {
        if ($.fn.DataTable.isDataTable(tableRef.current)) {
          table.destroy();
        }
      };
    }
  }, [referralList, tableKey]);

  // Global handlers
  useEffect(() => {
    window.handleEdit = async (id) => {
      try {
        const response = await Axios(SummaryApi.referral_get(id));
        if (response.data.success) {
          const data = response.data.data;
          setFormData({
            to_profile_id: data.to_profile_id,
            lead_type: data.lead_type,
            referral_type: data.referral_type,
            referral_status: data.referral_status,
            address: data.address || "",
            mobile_number: data.mobile_number || "",
            email: data.email || "",
            comments: data.comments || ""
          });
          setEditMode(true);
          setEditId(id);
          setShowForm(true);
        }
      } catch (error) {
        toast.error("Failed to load referral entry");
      }
    };

    window.handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this referral entry?")) {
        try {
          await Axios(SummaryApi.referral_delete(id));
          toast.success("Referral entry deleted successfully");
          
          // Reset form data after delete
          setFormData({
            to_profile_id: "",
            lead_type: "",
            referral_type: "",
            referral_status: "",
            address: "",
            mobile_number: "",
            email: "",
            comments: ""
          });
          setEditMode(false);
          setEditId(null);
          setErrors({});
          
          // Refresh table
          setTableKey(prev => prev + 1);
          await fetchReferralList();
        } catch (error) {
          toast.error("Failed to delete referral entry");
        }
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.to_profile_id) newErrors.to_profile_id = "Please select a user";
    if (!formData.lead_type) newErrors.lead_type = "Lead type is required";
    if (!formData.referral_type) newErrors.referral_type = "Referral type is required";
    if (!formData.referral_status) newErrors.referral_status = "Referral status is required";
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Mobile number validation
    if (formData.mobile_number && !/^[\+]?[0-9\s\-\(\)]{10,20}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = "Please enter a valid mobile number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (closeAfter = false) => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (editMode) {
        response = await Axios({
          ...SummaryApi.referral_update(editId),
          data: formData
        });
      } else {
        response = await Axios({
          ...SummaryApi.referral_create,
          data: formData
        });
      }

      if (response.data.success) {
        toast.success(editMode ? "Referral entry updated successfully" : "Referral entry created successfully");
        
        if (closeAfter) {
          setShowForm(false);
        }
        
        // Reset form
        setFormData({
          to_profile_id: "",
          lead_type: "",
          referral_type: "",
          referral_status: "",
          address: "",
          mobile_number: "",
          email: "",
          comments: ""
        });
        setEditMode(false);
        setEditId(null);
        setErrors({});
        
        // Refresh table
        setTableKey(prev => prev + 1);
        await fetchReferralList();
      }
    } catch (error) {
      console.error('Save error:', error);
      
      // Handle validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const newErrors = {};
        
        // Map backend validation errors to form fields
        Object.keys(validationErrors).forEach(key => {
          newErrors[key] = validationErrors[key][0];
        });
        
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to save referral entry");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      to_profile_id: "",
      lead_type: "",
      referral_type: "",
      referral_status: "",
      address: "",
      mobile_number: "",
      email: "",
      comments: ""
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});
  };

  const handleNewEntry = () => {
    setFormData({
      to_profile_id: "",
      lead_type: "",
      referral_type: "",
      referral_status: "",
      address: "",
      mobile_number: "",
      email: "",
      comments: ""
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});
    setShowForm(true);
  };

  return (
    <div className="referral-container">
      <PageHeader title="Referral Management" />
      
      <div className="referral-card">
        {/* Header with Add New button */}
        <div className="card-header">
          <div className="header-left">
            <h2 className="card-title">Referral Entries</h2>
          </div>
          <div className="header-right">
            {!showForm && (
              <button 
                onClick={handleNewEntry}
                className="btn-primary"
              >
                + Add New Referral
              </button>
            )}
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="form-section">
            <div className="form-header">
              <h3>{editMode ? 'Edit Referral Entry' : 'New Referral Entry'}</h3>
              <div className="form-actions">
                <button 
                  onClick={() => handleSave(false)} 
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={() => handleSave(true)} 
                  className="btn-save-close"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save & Close'}
                </button>
                <button 
                  onClick={handleCancel} 
                  className="btn-cancel"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="form-body">
              <div className="form-grid">
                {/* To */}
                <div className="form-group">
                  <label htmlFor="to_profile_id">
                    To <span className="required">*</span>
                  </label>
                  <select
                    id="to_profile_id"
                    name="to_profile_id"
                    value={formData.to_profile_id}
                    onChange={handleInputChange}
                    className={`form-control ${errors.to_profile_id ? 'error' : ''}`}
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.value} value={user.value}>
                        {user.label}
                      </option>
                    ))}
                  </select>
                  {errors.to_profile_id && (
                    <span className="error-message">{errors.to_profile_id}</span>
                  )}
                </div>

                {/* Lead Type */}
                <div className="form-group">
                  <label htmlFor="lead_type">
                    Lead Type <span className="required">*</span>
                  </label>
                  <select
                    id="lead_type"
                    name="lead_type"
                    value={formData.lead_type}
                    onChange={handleInputChange}
                    className={`form-control ${errors.lead_type ? 'error' : ''}`}
                  >
                    <option value="">Select Lead Type</option>
                    <option value="HOT">HOT</option>
                    <option value="WARM">WARM</option>
                    <option value="COLD">COLD</option>
                  </select>
                  {errors.lead_type && (
                    <span className="error-message">{errors.lead_type}</span>
                  )}
                </div>

                {/* Referral Type */}
                <div className="form-group">
                  <label htmlFor="referral_type">
                    Referral Type <span className="required">*</span>
                  </label>
                  <select
                    id="referral_type"
                    name="referral_type"
                    value={formData.referral_type}
                    onChange={handleInputChange}
                    className={`form-control ${errors.referral_type ? 'error' : ''}`}
                  >
                    <option value="">Select Type</option>
                    <option value="inside">Inside</option>
                    <option value="outside">Outside</option>
                  </select>
                  {errors.referral_type && (
                    <span className="error-message">{errors.referral_type}</span>
                  )}
                </div>

                {/* Referral Status */}
                <div className="form-group">
                  <label>
                    Referral Status <span className="required">*</span>
                  </label>
                  <div className="radio-group">
                    <div className="radio-item">
                      <input
                        type="radio"
                        id="given_card"
                        name="referral_status"
                        value="given_card"
                        checked={formData.referral_status === 'given_card'}
                        onChange={handleInputChange}
                        className={errors.referral_status ? 'error' : ''}
                      />
                      <label htmlFor="given_card">Given Your Card</label>
                    </div>
                    <div className="radio-item">
                      <input
                        type="radio"
                        id="told_call"
                        name="referral_status"
                        value="told_call"
                        checked={formData.referral_status === 'told_call'}
                        onChange={handleInputChange}
                        className={errors.referral_status ? 'error' : ''}
                      />
                      <label htmlFor="told_call">Told Them You Would Call</label>
                    </div>
                  </div>
                  {errors.referral_status && (
                    <span className="error-message">{errors.referral_status}</span>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="form-group">
                  <label htmlFor="mobile_number">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobile_number"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    className={`form-control ${errors.mobile_number ? 'error' : ''}`}
                    placeholder="Enter mobile number"
                  />
                  {errors.mobile_number && (
                    <span className="error-message">{errors.mobile_number}</span>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Address */}
                <div className="form-group full-width">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="Enter address..."
                  />
                </div>

                {/* Comments */}
                <div className="form-group full-width">
                  <label htmlFor="comments">Comments</label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="Enter any additional comments..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="table-section">
          {loading && !showForm ? (
            <div className="loading-container">
              <div className="loader">
                <div className="loader-circle"></div>
                <div className="loader-circle"></div>
                <div className="loader-circle"></div>
              </div>
              <p className="loading-text">Loading referrals...</p>
            </div>
          ) : (
            <div key={tableKey} className="table-container">
              <table ref={tableRef} className="referral-table" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referral;