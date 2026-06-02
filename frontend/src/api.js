const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function sendHttpRequest(path, method = "GET", body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const token = localStorage.getItem("easymart_token");
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    
    let data = null;
    const text = await res.text();
    if (text) {
      data = JSON.parse(text);
    }

    if (!res.ok) {
      const errorMsg = data?.detail || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const backendClient = {
  authenticateUser: (credentials) => sendHttpRequest("/auth/login", "POST", credentials),
  signUpUser: (userData) => sendHttpRequest("/auth/register", "POST", userData),
  getCurrentSession: () => sendHttpRequest("/auth/me"),

  fetchOverviewMetrics: () => sendHttpRequest("/dashboard/stats"),

  fetchClientList: () => sendHttpRequest("/customers"),
  registerClientProfile: (customer) => sendHttpRequest("/customers", "POST", customer),
  updateClientProfile: (id, customer) => sendHttpRequest(`/customers/${id}`, "PUT", customer),
  removeClientProfile: (id) => sendHttpRequest(`/customers/${id}`, "DELETE"),

  fetchProductCatalog: () => sendHttpRequest("/products"),
  addNewProductEntry: (product) => sendHttpRequest("/products", "POST", product),
  updateProductEntry: (id, product) => sendHttpRequest(`/products/${id}`, "PUT", product),
  removeProductEntry: (id) => sendHttpRequest(`/products/${id}`, "DELETE"),

  fetchOrderLogs: () => sendHttpRequest("/orders"),
  submitNewOrder: (order) => sendHttpRequest("/orders", "POST", order),
  fetchOrderDetailsById: (id) => sendHttpRequest(`/orders/${id}`),
  cancelOrderEntry: (id) => sendHttpRequest(`/orders/${id}`, "DELETE"),
};
