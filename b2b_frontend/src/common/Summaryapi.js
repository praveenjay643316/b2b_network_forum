export const baseUrl = import.meta.env.VITE_API_URL;

const SummaryApi = {
    get_count: {
        url: '/data_count.php',
        method: 'GET'
    },
    get_messages_count: {
        url: '/get_messages_count.php',
        method: 'GET'
    },
    get_messages: {
        url: "/get_messages.php",
        method: "get"
    },
    get_users: {
        url: "/get_users",
        method: "get"
    },
    get_templates: {
        url: "/get_templates.php",
        method: "get"
    },
    send_message: {
        url: "/send_messages/single_concept.php",
        method: "post"
    },
    send_template: {
        url: "/send_messages/template_concept.php",
        method: "post"
    },
    get_images: {
        url: "/images.php/images",
        method: "get"
    },
    upload_images: {
        url: "/images.php/images/upload",
        method: "post"
    },
    delete_image: {
        url: "/images.php/images/delete",
        method: "delete"
    },
    send_image: {
        url: "/send_messages/file_concept.php",
        method: "post"
    },
    login: {
        url: "/login",
        method: "POST"
    },
    register: {
        url: '/register',
        method: 'POST'
    },
    logout: {
        url: '/auth/logout.php',
        method: 'POST'
    },
    verifyToken: {
        url: '/user',
        method: 'GET',
    },
    get_users: {
  url: '/get_users',
  method: 'GET',
},
create_user: {
  url: '/create_user',
  method: 'POST',
},
get_user_by_id: (id) => ({
  url: `/users/${id}`,
  method: 'GET',
}),
update_user_by_id: (id) => ({
  url: `/users/${id}`,
  method: 'PUT',
}),
delete_user_by_id: (id) => ({
  url: `/users/${id}`,
  method: 'DELETE',
}),
changePassword: {
    url: '/change-password',
    method: 'POST'
},

// ... existing code ...

// TYFCB endpoints
tyfcb_list: {
  url: '/tyfcb',
  method: 'GET',
},
tyfcb_create: {
  url: '/tyfcb',
  method: 'POST',
},
tyfcb_get: (id) => ({
  url: `/tyfcb/${id}`,
  method: 'GET',
}),
tyfcb_update: (id) => ({
  url: `/tyfcb/${id}`,
  method: 'PUT',
}),
tyfcb_delete: (id) => ({
  url: `/tyfcb/${id}`,
  method: 'DELETE',
}),
tyfcb_users: {
  url: '/tyfcb-users',
  method: 'GET',
},

// Referral endpoints
referral_list: {
  url: '/referral',
  method: 'GET',
},
referral_create: {
  url: '/referral',
  method: 'POST',
},
referral_get: (id) => ({
  url: `/referral/${id}`,
  method: 'GET',
}),
referral_update: (id) => ({
  url: `/referral/${id}`,
  method: 'PUT',
}),
referral_delete: (id) => ({
  url: `/referral/${id}`,
  method: 'DELETE',
}),
referral_users: {
  url: '/referral-users',
  method: 'GET',
},

// Face to Face endpoints
face_to_face_list: {
  url: '/face-to-face',
  method: 'GET',
},
face_to_face_create: {
  url: '/face-to-face',
  method: 'POST',
},
face_to_face_get: (id) => ({
  url: `/face-to-face/${id}`,
  method: 'GET',
}),
face_to_face_update: (id) => ({
  url: `/face-to-face/${id}`,
  method: 'PUT',
}),
face_to_face_delete: (id) => ({
  url: `/face-to-face/${id}`,
  method: 'DELETE',
}),
face_to_face_users: {
  url: '/face-to-face-users',
  method: 'GET',
},
// Report endpoints
report_generate: {
  url: '/report',
  method: 'GET',
},
report_export_pdf: {
  url: '/report/export-pdf',
  method: 'GET',
},
report_export_csv: {
  url: '/report/export-csv',
  method: 'GET',
},
report_users: {
  url: '/report/users-list',
  method: 'GET',
},
}

export default SummaryApi