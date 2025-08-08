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
}

export default SummaryApi