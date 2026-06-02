# 🚀 EasyMart – Inventory & Order Management System




\

### Production-Ready Full Stack Inventory & Order Management Platform

Manage products, customers, inventory, and transactions with a modern React frontend and FastAPI backend.

🌐 **Live Demo:** https://inventory-system-ten-woad.vercel.app/


# ✨ Key Features

### 📦 Inventory Management

* Create Products
* Update Inventory Levels
* Stock Monitoring
* Product Catalog Management

### 👥 Customer Management

* Customer Registration
* Customer Profiles
* Customer Order History

### 💳 Transaction Management

* Order Processing
* Transaction Tracking
* Checkout Workflow

### 🔐 Authentication

* Secure Login
* User Registration
* Protected Routes

### 📊 Dashboard

* Business Overview
* Product Insights
* Inventory Statistics

### 🌐 REST API

* FastAPI-powered Backend
* OpenAPI Documentation
* Scalable Architecture

---

# 🏗 System Architecture

```text
┌─────────────────┐
│   React Frontend │
└────────┬────────┘
         │ Axios
         ▼
┌─────────────────┐
│   FastAPI API   │
└────────┬────────┘
         │ SQLAlchemy
         ▼
┌─────────────────┐
│    Database     │
└─────────────────┘
```

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* JavaScript
* Axios
* React Router DOM
* CSS

## Backend

* FastAPI
* SQLAlchemy
* Python

## DevOps

* Docker
* Docker Compose
* Vercel
* Render

---

# 📁 Project Structure

```text
EasyMart
│
├── backend
│   ├── app
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

# ⚙️ Local Setup

## Clone Repository

```bash
git clone https://github.com/ankitkandpal-1/inventory-system.git

cd inventory-system
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# 🐳 Docker Deployment

Build and Run:

```bash
docker compose up --build
```

Detached Mode:

```bash
docker compose up --build -d
```

Stop Containers:

```bash
docker compose down
```

---

# 📚 API Documentation

### Swagger UI

```text
http://localhost:8000/docs
```

### ReDoc

```text
http://localhost:8000/redoc
```

---

# 🌍 Live Deployment

### Frontend

https://inventory-system-ten-woad.vercel.app/

### Backend

Deployable via Render using included `render.yaml`.

---

# 🚀 Future Roadmap

* Payment Gateway Integration
* Analytics Dashboard
* AI-Based Inventory Forecasting
* Email Notifications
* Multi-User Roles & Permissions
* Admin Panel
* Advanced Reporting

---

# 👨‍💻 Author

### Ankit Kandpal

B.Tech Student | Software Developer | AI/ML Enthusiast

GitHub:
https://github.com/ankitkandpal-1

LinkedIn:
(Add Your LinkedIn URL)

Email:
[ankitkandpal210@gmail.com](mailto:ankitkandpal210@gmail.com)

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

# 📄 License

This project is developed for educational and portfolio purposes.
