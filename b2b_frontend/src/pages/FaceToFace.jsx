import React, { useState, useEffect, useRef } from "react";
import PageHeader from "../components/utils/PageHeader";
import $ from "jquery";
import "datatables.net-dt";
import Axios from "../utils/axios";
import SummaryApi from "../common/Summaryapi";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FaceToFace = () => {
  const tableRef = useRef();
  const [loading, setLoading] = useState(false);
  const [faceToFaceList, setFaceToFaceList] = useState([]);
  const [users, setUsers] = useState([]);
  const [tableKey, setTableKey] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    met_with_profile_id: "",
    invited_by_profile_id: "",
    location: "",
    date: new Date()
  });

  const [errors, setErrors] = useState({});

  // Fetch Face to Face list
  const fetchFaceToFaceList = async () => {
    setLoading(true);
    try {
      const response = await Axios(SummaryApi.face_to_face_list);
      if (response.data.success) {
        setFaceToFaceList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching Face to Face list:", error);
      toast.error("Failed to load Face to Face entries");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await Axios(SummaryApi.face_to_face_users);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchFaceToFaceList();
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
        data: faceToFaceList,
        columns: [
          { 
            title: "Met With", 
            data: "met_with_name",
            className: "font-medium",
            defaultContent: "-"
          },
          { 
            title: "Invited By", 
            data: "invited_by_name",
            className: "font-medium",
            defaultContent: "-"
          },
          { 
            title: "Location", 
            data: "location",
            defaultContent: "-"
          },
          { 
            title: "Date", 
            data: "date",
            render: (data) => {
              if (!data) return '-';
              const date = new Date(data);
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            },
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
              if (!row.face_to_face_id) return '-';
              return `
                <div class="action-buttons">
                  <button onclick="handleEdit('${row.face_to_face_id}')" class="btn-action btn-edit">Edit</button>
                  <button onclick="handleDelete('${row.face_to_face_id}')" class="btn-action btn-delete">Delete</button>
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
          searchPlaceholder: "Search Face to Face entries...",
          lengthMenu: "Show _MENU_",
          info: "Showing _START_ to _END_ of _TOTAL_ entries",
          emptyTable: "No Face to Face entries found",
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
  }, [faceToFaceList, tableKey]);

  // Global handlers
  useEffect(() => {
    window.handleEdit = async (id) => {
      try {
        const response = await Axios(SummaryApi.face_to_face_get(id));
        if (response.data.success) {
          const data = response.data.data;
          setFormData({
            met_with_profile_id: data.met_with_profile_id,
            invited_by_profile_id: data.invited_by_profile_id,
            location: data.location,
            date: new Date(data.date)
          });
          setEditMode(true);
          setEditId(id);
          setShowForm(true);
        }
      } catch (error) {
        toast.error("Failed to load Face to Face entry");
      }
    };

    window.handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this Face to Face entry?")) {
        try {
          await Axios(SummaryApi.face_to_face_delete(id));
          toast.success("Face to Face entry deleted successfully");
          
          // Reset form data after delete
          setFormData({
            met_with_profile_id: "",
            invited_by_profile_id: "",
            location: "",
            date: new Date()
          });
          setEditMode(false);
          setEditId(null);
          setErrors({});
          
          // Refresh table
          setTableKey(prev => prev + 1);
          await fetchFaceToFaceList();
        } catch (error) {
          toast.error("Failed to delete Face to Face entry");
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

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
    
    if (errors.date) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.date;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.met_with_profile_id) newErrors.met_with_profile_id = "Please select who you met with";
    if (!formData.invited_by_profile_id) newErrors.invited_by_profile_id = "Please select who invited you";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.date) newErrors.date = "Date is required";
    
    // Check if date is in the future
    if (formData.date && formData.date > new Date()) {
      newErrors.date = "Date cannot be in the future";
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
      const submitData = {
        ...formData,
        date: formData.date.toISOString().split('T')[0] // Format date as YYYY-MM-DD
      };

      let response;
      if (editMode) {
        response = await Axios({
          ...SummaryApi.face_to_face_update(editId),
          data: submitData
        });
      } else {
        response = await Axios({
          ...SummaryApi.face_to_face_create,
          data: submitData
        });
      }

      if (response.data.success) {
        toast.success(editMode ? "Face to Face entry updated successfully" : "Face to Face entry created successfully");
        
        if (closeAfter) {
          setShowForm(false);
        }
        
        // Reset form
        setFormData({
          met_with_profile_id: "",
          invited_by_profile_id: "",
          location: "",
          date: new Date()
        });
        setEditMode(false);
        setEditId(null);
        setErrors({});
        
        // Refresh table
        setTableKey(prev => prev + 1);
        await fetchFaceToFaceList();
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
        toast.error(error.response?.data?.message || "Failed to save Face to Face entry");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      met_with_profile_id: "",
      invited_by_profile_id: "",
      location: "",
      date: new Date()
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});
  };

  const handleNewEntry = () => {
    setFormData({
      met_with_profile_id: "",
      invited_by_profile_id: "",
      location: "",
      date: new Date()
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});
    setShowForm(true);
  };

  return (
    <div className="face-to-face-container">
      <PageHeader title="Face to Face Management" />
      
      <div className="face-to-face-card">
        {/* Header with Add New button */}
        <div className="card-header">
          <div className="header-left">
            <h2 className="card-title">Face to Face Entries</h2>
          </div>
          <div className="header-right">
            {!showForm && (
              <button 
                onClick={handleNewEntry}
                className="btn-primary"
              >
                + Add New Face to Face
              </button>
            )}
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="form-section">
            <div className="form-header">
              <h3>{editMode ? 'Edit Face to Face Entry' : 'New Face to Face Entry'}</h3>
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
                {/* Met With */}
                <div className="form-group">
                  <label htmlFor="met_with_profile_id">
                    Met With <span className="required">*</span>
                  </label>
                  <select
                    id="met_with_profile_id"
                    name="met_with_profile_id"
                    value={formData.met_with_profile_id}
                    onChange={handleInputChange}
                    className={`form-control ${errors.met_with_profile_id ? 'error' : ''}`}
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.value} value={user.value}>
                        {user.label}
                      </option>
                    ))}
                  </select>
                  {errors.met_with_profile_id && (
                    <span className="error-message">{errors.met_with_profile_id}</span>
                  )}
                </div>

                {/* Invited By */}
                <div className="form-group">
                  <label htmlFor="invited_by_profile_id">
                    Invited By <span className="required">*</span>
                  </label>
                  <select
                    id="invited_by_profile_id"
                    name="invited_by_profile_id"
                    value={formData.invited_by_profile_id}
                    onChange={handleInputChange}
                    className={`form-control ${errors.invited_by_profile_id ? 'error' : ''}`}
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.value} value={user.value}>
                        {user.label}
                      </option>
                    ))}
                  </select>
                  {errors.invited_by_profile_id && (
                    <span className="error-message">{errors.invited_by_profile_id}</span>
                  )}
                </div>

                {/* Location */}
                <div className="form-group">
                  <label htmlFor="location">
                    Location <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`form-control ${errors.location ? 'error' : ''}`}
                    placeholder="Enter location"
                    maxLength="500"
                  />
                  {errors.location && (
                    <span className="error-message">{errors.location}</span>
                  )}
                </div>

                {/* Date */}
                <div className="form-group">
                  <label htmlFor="date">
                    Date <span className="required">*</span>
                  </label>
                  <DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    className={`form-control ${errors.date ? 'error' : ''}`}
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()}
                    placeholderText="Select date"
                    showYearDropdown
                    showMonthDropdown
                                        dropdownMode="select"
                  />
                  {errors.date && (
                    <span className="error-message">{errors.date}</span>
                  )}
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
              <p className="loading-text">Loading Face to Face entries...</p>
            </div>
          ) : (
            <div key={tableKey} className="table-container">
              <table ref={tableRef} className="face-to-face-table" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceToFace;