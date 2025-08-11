import React, { useState, useEffect, useRef } from "react";
import PageHeader from "../components/utils/PageHeader";
import Axios from "../utils/axios";
import SummaryApi from "../common/Summaryapi";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import $ from "jquery";
import "datatables.net-dt";

const Report = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  
  // Separate refs for each table
  const tyfcbTableRef = useRef();
  const referralTableRef = useRef();
  const faceToFaceTableRef = useRef();
  
  const [filters, setFilters] = useState({
    from_date: new Date(new Date().setDate(new Date().getDate() - 30)), // Default last 30 days
    to_date: new Date(),
    report_type: "all"
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
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

  const handleDateChange = (date, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: date
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!filters.from_date) newErrors.from_date = "From date is required";
    if (!filters.to_date) newErrors.to_date = "To date is required";
    if (filters.from_date && filters.to_date && filters.from_date > filters.to_date) {
      newErrors.to_date = "To date must be after from date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateReport = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      const params = {
        from_date: filters.from_date.toISOString().split('T')[0],
        to_date: filters.to_date.toISOString().split('T')[0],
        report_type: filters.report_type
      };

      const response = await Axios({
        ...SummaryApi.report_generate,
        params
      });

      if (response.data.success) {
        setReportData(response.data);
        setTableKey(prev => prev + 1); // Force table re-initialization
        toast.success("Report generated successfully");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    if (!reportData) {
      toast.error("Please generate a report first");
      return;
    }

    setExporting(true);
    try {
      const params = {
        from_date: filters.from_date.toISOString().split('T')[0],
        to_date: filters.to_date.toISOString().split('T')[0],
        report_type: filters.report_type
      };

      const endpoint = format === 'pdf' ? SummaryApi.report_export_pdf : SummaryApi.report_export_csv;
      
      const response = await Axios({
        ...endpoint,
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${filters.report_type}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Report exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      toast.error(`Failed to export report as ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  // Initialize DataTables
  useEffect(() => {
    if (reportData) {
      // Destroy existing tables before reinitializing
      [tyfcbTableRef, referralTableRef, faceToFaceTableRef].forEach(ref => {
        if (ref.current && $.fn.DataTable.isDataTable(ref.current)) {
          $(ref.current).DataTable().destroy();
        }
      });

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Initialize TYFCB Table
        if (tyfcbTableRef.current && reportData.data?.tyfcb && reportData.data.tyfcb.length > 0) {
          $(tyfcbTableRef.current).DataTable({
            data: reportData.data.tyfcb,
            columns: [
              { 
                title: "S.No", 
                data: null,
                render: (data, type, row, meta) => meta.row + 1,
                orderable: false,
                width: "60px"
              },
              { 
                title: "Thank You To", 
                data: "thank_you_to",
                defaultContent: "-"
              },
              { 
                title: "Amount", 
                data: "referral_amount",
                render: (data) => `$${data || '0.00'}`,
                defaultContent: "$0.00"
              },
              { 
                title: "Business Type", 
                data: "business_type",
                defaultContent: "-"
              },
              { 
                title: "Referral Type", 
                data: "referral_type",
                defaultContent: "-"
              },
              { 
                title: "Comments", 
                data: "comments",
                render: (data) => data ? (data.length > 50 ? data.substring(0, 50) + '...' : data) : '-',
                defaultContent: "-"
              },
              { 
                title: "Date", 
                data: "created_at",
                render: (data) => {
                  if (!data) return '-';
                  const date = new Date(data);
                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                },
                defaultContent: "-"
              }
            ],
            pageLength: 10,
            responsive: true,
            dom: '<"datatable-top"<"dt-left"l><"dt-right"f>>t<"datatable-bottom"<"dt-info"i><"dt-pagination"p>>',
            language: {
              search: "",
              searchPlaceholder: "Search TYFCB entries...",
              lengthMenu: "Show _MENU_ entries",
              info: "Showing _START_ to _END_ of _TOTAL_ entries",
              emptyTable: "No TYFCB entries found",
              zeroRecords: "No matching entries found"
            }
          });
        }

        // Initialize Referral Table
        if (referralTableRef.current && reportData.data?.referral && reportData.data.referral.length > 0) {
          $(referralTableRef.current).DataTable({
            data: reportData.data.referral,
            columns: [
              { 
                title: "S.No", 
                data: null,
                render: (data, type, row, meta) => meta.row + 1,
                orderable: false,
                width: "60px"
              },
              { 
                title: "Referred To", 
                data: "referred_to",
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
                title: "Type", 
                data: "referral_type",
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
                defaultContent: "-"
              },
              { 
                title: "Email", 
                data: "email",
                defaultContent: "-"
              },
              { 
                title: "Date", 
                data: "created_at",
                render: (data) => {
                  if (!data) return '-';
                  const date = new Date(data);
                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                },
                defaultContent: "-"
              }
            ],
            pageLength: 10,
            responsive: true,
            dom: '<"datatable-top"<"dt-left"l><"dt-right"f>>t<"datatable-bottom"<"dt-info"i><"dt-pagination"p>>',
            language: {
              search: "",
              searchPlaceholder: "Search referral entries...",
              lengthMenu: "Show _MENU_ entries",
              info: "Showing _START_ to _END_ of _TOTAL_ entries",
              emptyTable: "No referral entries found",
              zeroRecords: "No matching entries found"
            }
          });
        }

        // Initialize Face to Face Table
        if (faceToFaceTableRef.current && reportData.data?.face_to_face && reportData.data.face_to_face.length > 0) {
          $(faceToFaceTableRef.current).DataTable({
            data: reportData.data.face_to_face,
            columns: [
              { 
                title: "S.No", 
                data: null,
                render: (data, type, row, meta) => meta.row + 1,
                orderable: false,
                width: "60px"
              },
              { 
                title: "Met With", 
                data: "met_with",
                defaultContent: "-"
              },
              { 
                title: "Invited By", 
                data: "invited_by",
                defaultContent: "-"
              },
              { 
                title: "Location", 
                data: "location",
                render: (data) => data ? (data.length > 30 ? data.substring(0, 30) + '...' : data) : '-',
                defaultContent: "-"
              },
              { 
                title: "Meeting Date", 
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
                render: (data) => {
                  if (!data) return '-';
                  const date = new Date(data);
                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                },
                defaultContent: "-"
              }
            ],
            pageLength: 10,
            responsive: true,
            dom: '<"datatable-top"<"dt-left"l><"dt-right"f>>t<"datatable-bottom"<"dt-info"i><"dt-pagination"p>>',
            language: {
              search: "",
              searchPlaceholder: "Search face to face entries...",
              lengthMenu: "Show _MENU_ entries",
              info: "Showing _START_ to _END_ of _TOTAL_ entries",
              emptyTable: "No face to face entries found",
              zeroRecords: "No matching entries found"
            }
          });
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      [tyfcbTableRef, referralTableRef, faceToFaceTableRef].forEach(ref => {
        if (ref.current && $.fn.DataTable.isDataTable(ref.current)) {
          $(ref.current).DataTable().destroy();
        }
      });
    };
  }, [reportData, tableKey]);

  const renderSummaryCard = (title, data) => {
    if (!data) return null;

    return (
      <div className="summary-card">
        <h3>{title}</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Entries</span>
            <span className="stat-value">{data.total_count || 0}</span>
          </div>
          {data.total_amount !== undefined && (
            <div className="stat-item">
              <span className="stat-label">Total Amount</span>
              <span className="stat-value">${data.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="report-container">
      <PageHeader title="My Reports" />
      
      <div className="report-card">
        {/* Filters Section */}
        <div className="filters-section">
          <h2 className="section-title">Generate Report</h2>
          
          <div className="filters-grid">
            {/* From Date */}
            <div className="form-group">
              <label htmlFor="from_date">
                From Date <span className="required">*</span>
              </label>
              <DatePicker
                selected={filters.from_date}
                onChange={(date) => handleDateChange(date, 'from_date')}
                className={`form-control ${errors.from_date ? 'error' : ''}`}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                placeholderText="Select from date"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
              />
              {errors.from_date && (
                <span className="error-message">{errors.from_date}</span>
              )}
            </div>

            {/* To Date */}
            <div className="form-group">
              <label htmlFor="to_date">
                To Date <span className="required">*</span>
              </label>
              <DatePicker
                selected={filters.to_date}
                onChange={(date) => handleDateChange(date, 'to_date')}
                className={`form-control ${errors.to_date ? 'error' : ''}`}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                minDate={filters.from_date}
                placeholderText="Select to date"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
              />
              {errors.to_date && (
                <span className="error-message">{errors.to_date}</span>
              )}
            </div>

            {/* Report Type */}
            <div className="form-group">
              <label htmlFor="report_type">
                Report Type <span className="required">*</span>
              </label>
              <select
                id="report_type"
                name="report_type"
                value={filters.report_type}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="all">All Report</option>
                <option value="tyfcb">TYFCB</option>
                <option value="referral">Referral</option>
                <option value="face_to_face">Face to Face</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button 
              onClick={generateReport}
              className="btn-generate"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="report-results">
            <div className="results-header">
              <h2 className="section-title">Report Results</h2>
              <div className="export-buttons">
                <button 
                  onClick={() => exportReport('pdf')}
                  className="btn-export btn-pdf"
                  disabled={exporting}
                >
                  {exporting ? 'Exporting...' : 'Export as PDF'}
                </button>
                <button 
                  onClick={() => exportReport('csv')}
                  className="btn-export btn-csv"
                  disabled={exporting}
                >
                  {exporting ? 'Exporting...' : 'Export as CSV'}
                </button>
              </div>
            </div>

            {/* Summary Section */}
            <div className="summary-section">
              {reportData.summary?.tyfcb && renderSummaryCard('TYFCB Summary', reportData.summary.tyfcb)}
              {reportData.summary?.referral && renderSummaryCard('Referral Summary', reportData.summary.referral)}
              {reportData.summary?.face_to_face && renderSummaryCard('Face to Face Summary', reportData.summary.face_to_face)}
            </div>

            {/* Data Tables */}
            <div className="data-section">
              {/* TYFCB Table */}
              {reportData.data?.tyfcb && reportData.data.tyfcb.length > 0 && (
                <div className="data-table-section">
                  <h3>TYFCB Entries</h3>
                  <div key={`tyfcb-${tableKey}`} className="table-container">
                    <table ref={tyfcbTableRef} className="report-table" />
                  </div>
                </div>
              )}

              {/* Referral Table */}
              {reportData.data?.referral && reportData.data.referral.length > 0 && (
                <div className="data-table-section">
                  <h3>Referral Entries</h3>
                  <div key={`referral-${tableKey}`} className="table-container">
                    <table ref={referralTableRef} className="report-table" />
                  </div>
                </div>
              )}

              {/* Face to Face Table */}
              {reportData.data?.face_to_face && reportData.data.face_to_face.length > 0 && (
                <div className="data-table-section">
                  <h3>Face to Face Entries</h3>
                  <div key={`face-to-face-${tableKey}`} className="table-container">
                    <table ref={faceToFaceTableRef} className="report-table" />
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {reportData.data && 
               (!reportData.data.tyfcb || reportData.data.tyfcb.length === 0) &&
               (!reportData.data.referral || reportData.data.referral.length === 0) &&
               (!reportData.data.face_to_face || reportData.data.face_to_face.length === 0) && (
                <div className="no-data-message">
                  <h3>No Data Found</h3>
                  <p>No records found for the selected date range and report type.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;