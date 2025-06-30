### Medical Lab Tracker
# 🧪 Medical Lab Test Tracker

A full-stack Medical Lab Test Tracker application that empowers lab technicians and doctors to manage patient records, input test results, flag abnormal values, and generate detailed lab reports.

## 🚀 Features

### ✅ Core Functionality
- 🔐 **JWT Authentication** with role-based access control (Admin, Doctor, LabTech)
- 👤 **Patient Record Management**: Create, view, update, and delete patients
- 🧪 **Lab Test Input**: Input CBC and other test results via clean UI forms
- 📏 **Abnormal Flagging Logic**: Compares results to configured min/max reference ranges
- 🧠 **Reference Range Management**: Admin dashboard to manage thresholds per test parameter
- 🕘 **Test History Tracking**: View historical lab results by patient
- 📤 **Report Generation**: Prepare lab result summaries (future support for PDF export)

### 🖥️ Frontend (React + Tailwind CSS)
- 📊 Dynamic dashboards for patients, lab tests, and summaries
- 💡 Styled with **Tailwind CSS** for a clean, responsive UI
- 🔁 Axios-based API integration with secure token handling
- 🚪 Logout button and session control

### 🛠️ Backend (Flask + SQLAlchemy + PostgreSQL)
- 📦 Modular Flask structure: `routes/`, `models/`, `controllers/`, `services/`
- 🔄 SQLAlchemy ORM for models and relationships
- 🎛️ Flask-Migrate for seamless schema migrations
- 📚 Structured and testable codebase

---

## 📁 Project Structure

Medical_Lab_Tracker/
├── client/ # React Frontend
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── api.js # Axios instance
│ │ └── App.jsx
│ └── tailwind.config.js
├── server/ # Flask Backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── app.py
│ └── run.py
├── migrations/ # Alembic migrations
├── .env
├── README.md
└── requirements.txt


---

## 🧑‍💻 Tech Stack

| Frontend            | Backend                 | Database    |
|---------------------|-------------------------|-------------|
| React               | Flask                   | PostgreSQL  |
| Tailwind CSS        | SQLAlchemy ORM          |             |
| Axios               | Flask-JWT-Extended      |             |
| React Router DOM    | Flask-Migrate           |             |

---

## 🔐 Authentication

- Uses JWT tokens via `Flask-JWT-Extended`
- Role-based logic to restrict access to admin-only pages (e.g., managing reference ranges)

---

## ⚙️ Setup Instructions

### 🐍 Backend Setup

```bash
# 1. Clone repo & navigate to backend
cd server/

# 2. Set up virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure your .env
cp .env.example .env

# 5. Run migrations
flask --app run db init   # first time only
flask --app run db migrate
flask --app run db upgrade

# 6. Run server
flask --app run.py run
⚛️ Frontend Setup
bash
Copy
Edit
# 1. Navigate to client
cd client/

# 2. Install dependencies
npm install

# 3. Start the React dev server
npm run dev

🧑‍⚕️ Author
Arnold Korir
Biomedical Engineer | Junior Backend Developer
📧 arnoldkorir201@gmail.com
🔗 GitHub | LinkedIn

