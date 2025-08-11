import React, { useState } from "react";
import {
  MdEmail,
  MdPerson,
  MdPhone,
  MdBusiness,
  MdLanguage
} from "react-icons/md";
import Logo from "../../assets/images/logo/dslogo.png";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    companyname: "",
    companyurl: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, register } = useAuth();

  // Redirect if user is already authenticated
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    if (!formData.companyname) newErrors.companyname = "Company name is required";

    if (
      formData.email &&
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    if (
      formData.mobile &&
      !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(formData.mobile)
    ) {
      newErrors.mobile = "Invalid mobile number";
    }

    if (
      formData.companyurl &&
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        formData.companyurl
      )
    ) {
      newErrors.companyurl = "Invalid URL format";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // 🚀 Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors.");
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const apiData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        personal_mobile: formData.mobile,
        personal_email: formData.email,
        company_name: formData.companyname,
        company_url: formData.companyurl,
      };

      const res = await register(apiData);

      if (res.success || res.message?.includes("User and Company created successfully")) {
        setSuccess(true);
        toast.success("Registration successful! Please check your email to verify your account.");

        setFormData({
          firstName: "",
          lastName: "",
          mobile: "",
          email: "",
          companyname: "",
          companyurl: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 3000);
      } else {
        if (res?.errors && typeof res.errors === "object") {
          const backendErrors = {};
          Object.keys(res.errors).forEach(key => {
            backendErrors[key] = res.errors[key].join(", ");
          });
          setErrors(backendErrors);
        }

        toast.error(res.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo */} 
       

        {/* ✅ SUCCESS MESSAGE INLINE */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            🎉 Registration successful!
          </div>
        )}

        {/* Form Start */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
             <div className="flex justify-center items-center h-24 mb-4">
          <img src={Logo} alt="Logo" className="w-56" />
        </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
              Personal Information
            </h2>

            <div className="flex space-x-4">
              {/* First Name */}
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-3 text-gray-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      errors.firstName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    disabled={loading}
                    placeholder="First Name"
                  />
                  {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
                </div>
              </div>

              {/* Last Name */}
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-3 text-gray-400" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div className="mt-4">
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.mobile
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  disabled={loading}
                  placeholder="Enter your mobile number"
                />
                {errors.mobile && <p className="text-sm text-red-600 mt-1">{errors.mobile}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  disabled={loading}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
              Company Information
            </h2>

            {/* Company Name */}
            <div>
              <label htmlFor="companyname" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdBusiness className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="companyname"
                  name="companyname"
                  type="text"
                  value={formData.companyname}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.companyname
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  disabled={loading}
                  placeholder="Enter your company name"
                />
                {errors.companyname && <p className="text-sm text-red-600 mt-1">{errors.companyname}</p>}
              </div>
            </div>

            {/* Company URL */}
            <div className="mt-4">
              <label htmlFor="companyurl" className="block text-sm font-medium text-gray-700 mb-2">
                Company URL
              </label>
              <div className="relative">
                <MdLanguage className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="companyurl"
                  name="companyurl"
                  type="url"
                  value={formData.companyurl}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.companyurl
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  disabled={loading}
                  placeholder="https://your-company.com"
                />
                {errors.companyurl && <p className="text-sm text-red-600 mt-1">{errors.companyurl}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Registering...
              </div>
            ) : success ? (
              "Registration Successful!"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Redirect Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/auth/login")}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </button>
          </p>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>© 2025 Your Company. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;