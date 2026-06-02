# EasyMart – Inventory & Order Management System

EasyMart is a production-ready, full-stack **Inventory & Order Management System** designed to manage products, customers, inventory, and transactions efficiently.

The project is built with a modern frontend and backend architecture using **React**, **FastAPI**, **Docker**, and cloud deployment support for **Render** and **Vercel**.

## Features

* Product & Inventory Management
* Customer Management
* Transaction Tracking
* Authentication System (Login/Register)
* Dashboard for Business Insights
* Checkout Flow
* REST API Architecture
* Dockerized Full-Stack Setup
* Cloud Deployment Ready (Render + Vercel)

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS
* Axios
* React Router DOM

### Backend

* FastAPI
* Python
* SQLAlchemy
* REST API

### DevOps & Deployment

* Docker
* Docker Compose
* Render (Backend Deployment)
* Vercel (Frontend Deployment)

## Project Structure

```txt
EasyMart/
│── backend/
│   ├── app/
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── requirements.txt
│   └── Dockerfile
│
│── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
│── docker-compose.yml
│── render.yaml
│── README.md
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ankitkandpal-1/inventory-system.git
cd inventory-system
```

### 2. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```

Backend will run on:

```txt
http://localhost:8000
```

---

### 3. Frontend Setup

Move to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

## Docker Setup

Run the full project with Docker:

```bash
docker compose up --build
```

Or run in detached mode:

```bash
docker compose up --build -d
```

Stop containers:

```bash
docker compose down
```

## API Documentation

FastAPI automatically provides API docs:

### Swagger UI

```txt
http://localhost:8000/docs
```

### ReDoc

```txt
http://localhost:8000/redoc
```

## Screens & Modules

* Dashboard
* Catalog
* Customers
* Transactions
* Checkout
* Login
* Register

## Deployment

### Frontend

Deploy using **Vercel**

### Backend

Deploy using **Render**

## Future Improvements

* Payment Integration
* Analytics Dashboard
* Order Notifications
* Role-Based Authentication
* Admin Panel
* AI-based Inventory Insights

## Author

**Ankit Kandpal**

* GitHub: https://github.com/ankitkandpal-1
* Email: [ankitkandpal210@gmail.com](mailto:ankitkandpal210@gmail.com)

## License

This project is for educational and learning purposes.
