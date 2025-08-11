import React, { useState, useEffect, useRef } from "react";
import PageHeader from "../components/utils/PageHeader";
import $ from "jquery";
import "datatables.net-dt";
import Axios from "../utils/axios";
import SummaryApi from "../common/Summaryapi";
import { toast } from "react-toastify";

const TYFCB = () => {
  const tableRef = useRef();
  const [loading, setLoading] = useState(false);
  const [tyfcbList, setTyfcbList] = useState([]);
  const [users, setUsers] = useState([]);
  const [tableKey, setTableKey] = useState(0);
  const [showForm, setShowForm] = useState(true); // Default to true to show form by default
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    tyt_profile_id: "",
    referral_amount: "",
    business_type: "",
    referral_type: "",
    comments: ""
  });

  const [errors, setErrors] = useState({});

  // Fetch TYFCB list
  const fetchTyfcbList = async () => {
    setLoading(true);
    try {
      const response = await Axios(SummaryApi.tyfcb_list);
      if (response.data.success) {
        setTyfcbList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching TYFCB list:", error);
      toast.error("Failed to load TYFCB entries");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await Axios(SummaryApi.tyfcb_users);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchTyfcbList();
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
        data: tyfcbList,
        columns: [
          { 
            title: "Thank You To", 
            data: "tyt_name",
            className: "font-medium",
            defaultContent: "-"
          },
          { 
            title: "Referral Amount", 
            data: "referral_amount",
            render: (data) => data ? `$${parseFloat(data).toFixed(2)}` : '-',
            defaultContent: "-"
          },
          { 
            title: "Business Type", 
            data: "business_type",
            render: (data) => {
              if (!data) return '-';
              const badge = data === 'new' 
                ? '<span class="badge-new">New</span>'
                : '<span class="badge-repeat">Repeat</span>';
              return badge;
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
            title: "Comments", 
            data: "comments",
            render: (data) => data || '-',
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
              if (!row.tyfcb_id) return '-';
              return `
                <div class="action-buttons">
                  <button onclick="handleEdit('${row.tyfcb_id}')" class="btn-action btn-edit">Edit</button>
                  <button onclick="handleDelete('${row.tyfcb_id}')" class="btn-action btn-delete">Delete</button>
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
          searchPlaceholder: "Search entries...",
          lengthMenu: "Show _MENU_",
          info: "Showing _START_ to _END_ of _TOTAL_ entries",
          emptyTable: "No TYFCB entries found",
          zeroRecords: "No matching entries found"
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
  }, [tyfcbList, tableKey]);

  // Global handlers
  useEffect(() => {
    window.handleEdit = async (id) => {
      try {
        const response = await Axios(SummaryApi.tyfcb_get(id));
        if (response.data.success) {
          const data = response.data.data;
          setFormData({
            tyt_profile_id: data.tyt_profile_id,
            referral_amount: data.referral_amount,
            business_type: data.business_type,
            referral_type: data.referral_type,
            comments: data.comments || ""
          });
          setEditMode(true);
          setEditId(id);
          setShowForm(true);
        }
      } catch (error) {
        toast.error("Failed to load entry");
      }
    };

    window.handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this entry?")) {
        try {
          await Axios(SummaryApi.tyfcb_delete(id));
          toast.success("Entry deleted successfully");
          
          // Reset form data after delete
          setFormData({
            tyt_profile_id: "",
            referral_amount: "",
            business_type: "",
            referral_type: "",
            comments: ""
          });
          setEditMode(false);
          setEditId(null);
          setErrors({});
          
          // Refresh table
          setTableKey(prev => prev + 1);
          await fetchTyfcbList();
        } catch (error) {
          toast.error("Failed to delete entry");
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
    
    if (!formData.tyt_profile_id) newErrors.tyt_profile_id = "Please select a user";
    if (!formData.referral_amount) newErrors.referral_amount = "Referral amount is required";
    if (formData.referral_amount && parseFloat(formData.referral_amount) < 0) {
      newErrors.referral_amount = "Amount must be positive";
    }
    if (!formData.business_type) newErrors.business_type = "Business type is required";
    if (!formData.referral_type) newErrors.referral_type = "Referral type is required";
    
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
          ...SummaryApi.tyfcb_update(editId),
          data: formData
        });
      } else {
        response = await Axios({
          ...SummaryApi.tyfcb_create,
          data: formData
        });
      }

      if (response.data.success) {
        toast.success(editMode ? "Entry updated successfully" : "Entry created successfully");
        
        if (closeAfter) {
          setShowForm(false);
        }
        
        // Reset form
        setFormData({
          tyt_profile_id: "",
          referral_amount: "",
          business_type: "",
          referral_type: "",
          comments: ""
        });
        setEditMode(false);
        setEditId(null);
        setErrors({});
        
        // Refresh table
        setTableKey(prev => prev + 1);
        await fetchTyfcbList();
      }
    } catch (error) {
      console.error('Save error:', error);
      
      // Handle validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const newErrors = {};
        
        // Map backend validation errors to form fields
        if (validationErrors.tyt_profile_id) {
          newErrors.tyt_profile_id = validationErrors.tyt_profile_id[0];
        }
        if (validationErrors.referral_amount) {
          newErrors.referral_amount = validationErrors.referral_amount[0];
        }
        if (validationErrors.business_type) {
          newErrors.business_type = validationErrors.business_type[0];
        }
        if (validationErrors.referral_type) {
          newErrors.referral_type = validationErrors.referral_type[0];
        }
        
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to save entry");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      tyt_profile_id: "",
      referral_amount: "",
      business_type: "",
      referral_type: "",
      comments: ""
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});
  };

  const handleNewEntry = () => {
    setFormData({
      tyt_profile_id: "",
      referral_amount: "",
      business_type: "",
      referral_type: "",
      comments: ""
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});
    setShowForm(true);
  };

  return (
    <div className="tyfcb-container">
      <PageHeader title="TYFCB - Thank You For Client Business" />
      
      <div className="tyfcb-card">
        {/* Header with Add New button */}
        <div className="card-header">
          <div className="header-left">
            <h2 className="card-title">TYFCB Entries</h2>
          </div>
          <div className="header-right">
            {!showForm && (
              <button 
                onClick={handleNewEntry}
                className="btn-primary"
              >
                + Add New Entry
              </button>
            )}
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="form-section">
            <div className="form-header">
              <h3>{editMode ? 'Edit TYFCB Entry' : 'New TYFCB Entry'}</h3>
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
                {/* Thank You To */}
                <div className="form-group">
                  <label htmlFor="tyt_profile_id">
                    Thank You To <span className="required">*</span>
                  </label>
                  <select
                    id="tyt_profile_id"
                    name="tyt_profile_id"
                    value={formData.tyt_profile_id}
                    onChange={handleInputChange}
                    className={`form-control ${errors.tyt_profile_id ? 'error' : ''}`}
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.value} value={user.value}>
                        {user.label}
                      </option>
                    ))}
                  </select>
                  {errors.tyt_profile_id && (
                    <span className="error-message">{errors.tyt_profile_id}</span>
                  )}
                </div>

                {/* Referral Amount */}
                <div className="form-group">
                  <label htmlFor="referral_amount">
                    Referral Amount ($) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="referral_amount"
                    name="referral_amount"
                    value={formData.referral_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`form-control ${errors.referral_amount ? 'error' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.referral_amount && (
                    <span className="error-message">{errors.referral_amount}</span>
                  )}
                </div>

                {/* Business Type */}
                <div className="form-group">
                  <label htmlFor="business_type">
                    Business Type <span className="required">*</span>
                  </label>
                  <select
                    id="business_type"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className={`form-control ${errors.business_type ? 'error' : ''}`}
                  >
                    <option value="">Select Type</option>
                    <option value="new">New</option>
                    <option value="repeat">Repeat</option>
                  </select>
                  {errors.business_type && (
                    <span className="error-message">{errors.business_type}</span>
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
              <p className="loading-text">Loading entries...</p>
            </div>
          ) : (
            <div key={tableKey} className="table-container">
              <table ref={tableRef} className="tyfcb-table" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TYFCB;