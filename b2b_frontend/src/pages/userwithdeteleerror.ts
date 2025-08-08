import React, { useEffect, useState, useRef } from "react";
import PageHeader from "../components/utils/PageHeader";
import UserModal from "../components/usermodel/UserModal"; // ✅ Import your modal here
import $ from "jquery";
import "datatables.net-dt";
import SummaryApi from "../common/Summaryapi";
import Axios from "../utils/axios";
import "../pages/style/dashboard.css"; // ✅ Custom CSS

const Users = () => {
  const tableRef = useRef();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view' or 'edit'
  const [selectedUser, setSelectedUser] = useState({});

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
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      $(tableRef.current).DataTable({
        data: users,
        columns: [
          { title: "Full Name", data: "full_name" },
          { title: "Mobile", data: "personal_mobile" },
          { title: "Email", data: "personal_email" },
          { title: "Company", data: "company_name" },
          { title: "Company URL", data: "company_url" },
          {
            title: "Status",
            data: "status",
            render: (data) => {
              const statusClass =
                data === "Saved" ? "badge-saved" : "badge-pending";
              return `<span class="${statusClass}">${data}</span>`;
            },
          },
          {
            title: "Actions",
            data: null,
            orderable: false,
            render: (data, type, row) => `
              <select class="action-select" onchange="handleActionDropdown(this, '${row.profile_id}')">
                <option value="">Choose</option>
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
              </select>
            `,
          },
        ],
        responsive: true,
        scrollY: "calc(100vh - 300px)",
        scrollCollapse: true,
        paging: true,
        dom: '<"datatable-header"lf>t<"datatable-footer"ip>',
      });
    }
  }, [users]);

  useEffect(() => {
    // Handle actions when dropdown changes
    window.handleActionDropdown = async (element, profileId) => {
      const action = element.value;
      element.value = ""; // Reset dropdown

      if (!profileId) return;

      if (action === "view" || action === "edit") {
        try {
          const res = await Axios({
            url: `/users/${profileId}`,
            method: "GET",
          });

          setSelectedUser({ ...res.data, profile_id: profileId });
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
            alert("User deleted.");
            getUsers();
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Delete failed.");
          }
        }
      }
    };
  }, [users]);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      await Axios({
        url: `/users/${selectedUser.profile_id}`,
        method: "PUT",
        data: selectedUser,
      });
      alert("User updated successfully!");
      setModalOpen(false);
      getUsers();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed.");
    }
  };

  return (
    <div>
      <PageHeader title="Users" />
      <div className="bg-white border p-3 rounded-lg h-[calc(100vh-200px)]">
        {loading ? (
          <div className="text-center">Loading users...</div>
        ) : (
          <table ref={tableRef} className="display w-full" style={{ width: "100%" }} />
        )}
      </div>

      {/* ✅ User Modal */}
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