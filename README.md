
# Smart Nutrition Label Analyzer – Health Score Predictor

An AI-powered full-stack web application that analyzes nutrition label images using OCR, extracts nutritional values, calculates a health score, and provides intelligent health recommendations through a dynamic dashboard.

---

## 🚀 Project Overview

Smart Nutrition Label Analyzer allows users to:

- Upload nutrition label images
- Extract nutritional values using OCR
- Calculate a health score (0–100)
- Categorize food into:
  - 🟢 Healthy
  - 🟡 Moderate
  - 🔴 Unhealthy
- Track previous analyses
- View health trends on dashboard

This system is built using a complete frontend + backend architecture and runs in **single-server production mode**.

---

## 🧠 Health Score Logic

```

Healthy    → Score ≥ 80
Moderate   → 50 ≤ Score < 80
Unhealthy  → Score < 50

````

The health score is calculated based on:

- Calories
- Sugar
- Fat
- Sodium
- Protein

---

## 🏗 Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Chart.js
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer (File Upload)
- Tesseract OCR

---

## 📸 Demo Screenshot

<img width="1364" height="719" alt="Screenshot 2026-02-18 225941" src="https://github.com/user-attachments/assets/a2500c1f-f24a-4d70-9cf9-5e573b9c8c8c" />
<img width="1358" height="620" alt="Screenshot 2026-02-18 230039" src="https://github.com/user-attachments/assets/04527286-ed0c-42e3-a173-979d05e80ba3" />
<img width="1365" height="707" alt="Screenshot 2026-02-18 230105" src="https://github.com/user-attachments/assets/27332ae3-86c7-4812-a3c8-834f0e3e5eb8" />
<img width="1362" height="716" alt="Screenshot 2026-02-18 230200" src="https://github.com/user-attachments/assets/df0dd354-2c5c-4de9-b02f-04c7ac05bbd0" />
<img width="1360" height="707" alt="Screenshot 2026-02-18 230220" src="https://github.com/user-attachments/assets/577722d3-227e-486b-921d-79fce3c719fd" />
<img width="1359" height="722" alt="Screenshot 2026-02-18 230117" src="https://github.com/user-attachments/assets/841b61b2-7058-4c62-ae08-bc095ca593f0" />

## ⚙️ How to Run (Development Mode)

### 1️⃣ Backend

```
cd server
npm install
npm start
```

### 2️⃣ Frontend

```
cd client
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

Backend runs on:

```
http://localhost:5000
```

---

## 🚀 Production Mode (Single Server Setup)

### Step 1 – Build React

```
cd client
npm run build
```

### Step 2 – Start Backend

```
cd server
npm start
```

Now open:

```
http://localhost:5000
```

Frontend + Backend run together using only ONE server.

---

## 📊 Key Features

* User Authentication (Register/Login)
* Smart OCR-based label extraction
* Dynamic health score calculation
* Dashboard analytics
* History tracking
* Responsive modern UI
* Production-ready structure

---

## 🎯 Project Purpose

This project demonstrates:

* Full-stack development skills
* OCR integration
* Backend API design
* Database integration
* Dynamic UI rendering
* Production deployment structure

---

## 👨‍💻 Author

Darshan S P
Computer Science Engineer
Full-Stack Developer

---

