import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Auto-attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("setec-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("setec-token");
      localStorage.removeItem("setec-user");
      window.location.href = "/setec/login";
    }
    return Promise.reject(err);
  }
);

// ── Students ──────────────────────────────────────────────────
export const getStudents      = (params?: object)      => api.get("/students", { params });
export const getStudent       = (id: number)           => api.get(`/students/${id}`);
export const getStudentBorrows= (id: number)           => api.get(`/students/${id}/borrows`);
export const createStudent    = (data: object)         => api.post("/students", data);
export const updateStudent    = (id: number, data: object) => api.put(`/students/${id}`, data);
export const deleteStudent    = (id: number)           => api.delete(`/students/${id}`);

// ── Staff ─────────────────────────────────────────────────────
export const getStaffs        = ()                     => api.get("/staffs");
export const getActiveStaffs  = ()                     => api.get("/staffs/active");
export const createStaff      = (data: object)         => api.post("/staffs", data);
export const updateStaff      = (id: number, data: object) => api.put(`/staffs/${id}`, data);
export const deleteStaff      = (id: number)           => api.delete(`/staffs/${id}`);

// ── Items ─────────────────────────────────────────────────────
export const getItems         = ()                     => api.get("/items");
export const getAvailableItems= ()                     => api.get("/items/available");
export const createItem       = (data: object)         => api.post("/items", data);
export const updateItem       = (id: number, data: object) => api.put(`/items/${id}`, data);
export const deleteItem       = (id: number)           => api.delete(`/items/${id}`);

// ── Borrows ───────────────────────────────────────────────────
export const getBorrows       = (params?: object)      => api.get("/borrows", { params });
export const getBorrowStats   = ()                     => api.get("/borrows/stats");
export const createBorrow     = (data: object)         => api.post("/borrows", data);
export const processReturn    = (id: number, data?: object) => api.patch(`/borrows/${id}/return`, data || {});
export const markOverdue      = (id: number)           => api.patch(`/borrows/${id}/overdue`);
export const deleteBorrow     = (id: number)           => api.delete(`/borrows/${id}`);

export default api;
