import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:7243/api",
    headers: {
        "Content-Type": "application/json"
    }
});


// ==========================================
// AUTOMATIC JWT AUTHORIZATION
// ==========================================

api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("token");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;
    },

    (error) => {

        return Promise.reject(error);

    }
);


// ==========================================
// HANDLE UNAUTHORIZED RESPONSE
// ==========================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        if (error.response?.status === 401) {

            console.error(
                "Unauthorized request. JWT token may be expired or missing."
            );

        }

        return Promise.reject(error);

    }

);


export default api;