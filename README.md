# 🛍️ FootCap - MERN E-Commerce Platform

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Live-success)

A production-ready **Full Stack MERN E-Commerce Platform** built with **React.js, Node.js, Express.js, and MongoDB**. The application provides a modern online shopping experience with secure authentication, product management, shopping cart, wishlist, online payments, and an admin dashboard.

---

## 🌐 Live Demo

### 🔗 Frontend
https://footcap-store.netlify.app/

### 🔗 Backend API
https://footcap-backend.onrender.com/

---

## 📸 Screenshots

> Add your project screenshots here.

| Home Page | Product Details |
|------------|-----------------|
| ![](https://res.cloudinary.com/xpfcyv3b/image/upload/f_auto,q_auto/Screenshot_2026-07-21_154956_b57hfl) | ![](https://res.cloudinary.com/xpfcyv3b/image/upload/f_auto,q_auto/Screenshot_2026-07-21_162513_wvxprm) |

| Cart | Admin Login |
|------|-----------------|
| ![](https://res.cloudinary.com/xpfcyv3b/image/upload/f_auto,q_auto/Screenshot_2026-07-21_162633_pxfxys)) | ![](https://res.cloudinary.com/xpfcyv3b/image/upload/f_auto,q_auto/Screenshot_2026-07-21_163937_jmhfzj) |

---

# ✨ Features

### 👤 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Role-Based Authorization
- Password Encryption using bcrypt

---

### 🛒 Shopping

- Browse Products
- Product Search
- Category Filter
- Price Filter
- Product Details
- Related Products
- Wishlist
- Shopping Cart
- Quantity Management

---

### 💳 Payments

- Razorpay Payment Gateway
- Secure Checkout
- Order Placement
- Order History

---

### 📦 Order Management

- Place Orders
- View Previous Orders
- Order Status
- Order Details

---

### 👨‍💼 Admin Dashboard

- Dashboard Overview
- Product Management
- Add Products
- Update Products
- Delete Products
- Order Management
- User Management
- Inventory Management

---

### 📱 User Experience

- Responsive Design
- Mobile Friendly
- Modern UI
- Loading Skeletons
- Toast Notifications
- Error Handling

---

# 🛠️ Tech Stack

## Frontend

- React.js
- React Router DOM
- Redux Toolkit
- Axios
- Tailwind CSS
- React Icons

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- Razorpay
- Nodemailer

## Deployment

- Netlify
- Render
- MongoDB Atlas

---

# 📂 Project Structure

```
FootCap
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   └── utils/
│
├── README.md
└── package.json
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/shreymehrotra07/FootCap.git
```

```
cd FootCap
```

---

## Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ../server
npm install
```

---

## Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=

MONGODB_URI=

JWT_SECRET=

JWT_REFRESH_SECRET=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

EMAIL_USER=

EMAIL_PASS=

CLIENT_URL=
```

---

## Run Frontend

```bash
cd client
npm run dev
```

---

## Run Backend

```bash
cd server
npm start
```

---

## Seed Database

```bash
npm run seed
```

This will generate and insert **2000+ products** into MongoDB.

---

# 📊 API Modules

- Authentication
- Users
- Products
- Categories
- Wishlist
- Cart
- Orders
- Payments
- Reviews
- Admin

---

# 🔐 Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Role-Based Access Control
- Input Validation
- Rate Limiting
- Secure Environment Variables
- CORS Configuration

---

# 🎯 Future Improvements

- Product Reviews & Ratings
- Coupon System
- Email Verification
- Multi-Vendor Support
- AI Product Recommendation
- Sales Analytics
- PWA Support
- Dark Mode
- Multi-language Support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/NewFeature
```

3. Commit your changes

```bash
git commit -m "Added New Feature"
```

4. Push to GitHub

```bash
git push origin feature/NewFeature
```

5. Open a Pull Request

---

# 👨‍💻 Author

### Shrey Mehrotra

**Aspiring Full Stack Developer**

- GitHub: https://github.com/shreymehrotra07
- LinkedIn: https://linkedin.com/in/shreymehrotra07

---

# ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

It motivates me to build more production-quality open-source projects.

---

## 📄 License

This project is licensed under the MIT License.
