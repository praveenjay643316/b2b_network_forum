import React from "react";
import {
  MdEmail,
  MdPerson,
  MdPhone,
  MdBusiness,
  MdLanguage,
  MdLocationOn,
  MdWork,
  MdAdminPanelSettings,
  MdGroups,
  MdPersonOutline
} from "react-icons/md";

const UserModal = ({
  isOpen,
  onClose,
  mode = "view",
  formData,
  setFormData,
  onSubmit,
}) => {
 
  if (!isOpen) return null;

  const isEditable = mode === "edit" || mode === "create";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-semibold text-gray-800 capitalize">
            {mode === "create" ? "Create New User" : `${mode} User Information`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6">
          <form onSubmit={onSubmit} className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <MdPerson className="mr-2" />
                  Personal Information
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name*
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.first_name || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.last_name || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <div className="relative">
                      <MdWork className="absolute top-3 left-3 text-gray-400" />
                      <input
                        type="text"
                        name="job_title"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.job_title || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone
                    </label>
                    <div className="relative">
                      <MdPhone className="absolute top-3 left-3 text-gray-400" />
                      <input
                        type="tel"
                        name="business_mobile_number"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.business_mobile_number || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Mobile*
                    </label>
                    <div className="relative">
                      <MdPhone className="absolute top-3 left-3 text-gray-400" />
                      <input
                        type="tel"
                        name="personal_mobile"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.personal_mobile || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <div className="relative">
                      <MdEmail className="absolute top-3 left-3 text-gray-400" />
                      <input
                        type="email"
                        name="personal_email"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.personal_email || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Type*
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-gray-400">
                        {formData.user_type === 'admin' ? <MdAdminPanelSettings size={20} /> : 
                         formData.user_type === 'leader' ? <MdGroups size={20} /> : 
                         <MdPersonOutline size={20} />}
                      </div>
                      <select
                        name="user_type"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        value={formData.user_type || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                        required
                      >
                        <option value="">Select user type</option>
                        <option value="admin">Admin</option>
                        <option value="leader">Leader</option>
                        <option value="user">User</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <MdBusiness className="mr-2" />
                  Company Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company_name || ""}
                      onChange={handleChange}
                      disabled={!isEditable}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Phone
                    </label>
                    <div className="relative">
                      <MdPhone className="absolute top-3 left-3 text-gray-400" />
                      <input
                        type="tel"
                        name="company_phone_number"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.company_phone_number || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <div className="relative">
                      <MdLanguage className="absolute top-3 left-3 text-gray-400" />
                      <input
                        type="url"
                        name="company_url"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.company_url || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1
                      </label>
                      <div className="relative">
                        <MdLocationOn className="absolute top-3 left-3 text-gray-400" />
                        <input
                          type="text"
                          name="address_1"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.address_1 || ""}
                          onChange={handleChange}
                          disabled={!isEditable}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        name="address_2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.address_2 || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 3
                      </label>
                      <input
                        type="text"
                        name="address_3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.address_3 || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.city || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.state || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zip_code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.zip_code || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country/Region
                      </label>
                      <input
                        type="text"
                        name="country_region"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.country_region || ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isEditable ? "Cancel" : "Close"}
              </button>
              {isEditable && (
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {mode === "create" ? "Create User" : "Save Changes"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;