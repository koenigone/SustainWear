# **SustainWear**

A Smart Clothing Donation & Sustainability Management Platform

---

## Project Overview

SustainWear is a full-stack web application designed to modernise and streamline clothing donations between donors, charity organisations, and administrators. The platform promotes sustainability by simplifying donation workflows, tracking environmental impact, and providing organisations with actionable insights through role-based dashboards.

Built using **React**, **Express.js**, and **SQLite**, SustainWear supports three core user roles, **Donor**, **Organisation Staff**, and **Admin**, each with dedicated tools and interfaces tailored to their responsibilities. Key features include real-time notifications, sustainability metrics, AI-assisted donation descriptions, reporting tools, and complete audit logs.

---

## Dashboards

### Donor Dashboard

![Donor Dashboard](https://github.com/user-attachments/assets/19e4f17d-bdee-49a0-9fef-c10e015e6bc3)

### Staff Dashboard

![Staff Dashboard](https://github.com/user-attachments/assets/c8e0ac31-b669-4d69-add1-d301cd1728a4)

### Admin Dashboard

![Admin Dashboard](https://github.com/user-attachments/assets/ac6c0f1b-a660-4e04-b9fb-02debfb7d8b8)

---

## Features Overview

### Donor Features

* Submit clothing donations with optional AI-generated descriptions
* Upload multiple images per donation
* Track donation history and status updates
* View sustainability impact metrics (e.g. CO₂ saved, landfill reduction)
* Compete on the Donor Leaderboard
* Receive real-time in-app and email notifications

**AI-Powered Donation Form**
![AI Donation Form](https://github.com/user-attachments/assets/e373dd1f-4797-4765-be79-736c734ea9cc)

**Donor Leaderboard**
![Donor Leaderboard](https://github.com/user-attachments/assets/e4734b26-87f9-4cc6-88ec-349735efef99)

---

### Organisation Staff Features

* Review and process incoming donations
* Approve, decline, or cancel donation requests
* Update inventory stock levels
* Monitor donation distribution records
* View organisation-level sustainability metrics

---

### Admin Features

* Manage users, organisations, and staff accounts
* Access system-wide dashboards and KPIs
* Generate detailed reports with date-range filtering
* Review complete audit logs of admin actions

**Admin Report Generation**
![Admin Reports](https://github.com/user-attachments/assets/b285d812-42c8-4964-9360-746e9da5afaa)

**Admin Action Logs**
![Admin Logs](https://github.com/user-attachments/assets/36ab80a6-cc0a-4a40-ba76-72be24c136a7)

---

## Fully Responsive Design

SustainWear was built using a **mobile-first design approach**, ensuring the platform is accessible, readable, and easy to use across all device types. Rather than shrinking a desktop interface, layouts progressively enhance as screen size increases.

### Responsive Behaviour by Device

- **Mobile Devices**
  - Card-based layouts optimised for touch interaction
  - Condensed views that prioritise essential information
  - Actions remain accessible without horizontal scrolling

- **Tablet Devices**
  - Expanded layouts that reveal additional contextual data
  - Improved information density while maintaining clarity
  - Interfaces adapt naturally to wider viewports

- **Desktop Devices**
  - Full administrative views with complete datasets
  - Higher data density to support efficient management workflows
  - Clear visual hierarchy for extended use

### Responsive Interface Examples

**Submit Donation - Mobile View**  
![Mobile Donation](https://github.com/user-attachments/assets/d669b175-5063-4c41-aec1-ac4822c827ae)

**Admin - Manage Users (Mobile View)**  
![Mobile Manage Users](https://github.com/user-attachments/assets/d26f2fe1-ca3e-4297-9ef8-6038f44bc6f8)

**Admin - Manage Organisations (Tablet View)**  
![Tablet Manage Organisations](https://github.com/user-attachments/assets/05c6bc2b-6dd3-4b75-8441-f537beedd271)

---

## Tech Stack

### Frontend

* React.js (Vite)
* Chakra UI
* Axios
* Context API (Authentication & Notifications)

### Backend

* Node.js / Express.js
* JWT Authentication
* Role-Based Access Control (RBAC)
* AI Description Service (OpenAI-powered)
* Email Services (password reset & notifications)

### Database

* SQLite (lightweight, file-based relational database)

---

## Role Capabilities

| Feature                     | Donor | Staff | Admin |
| --------------------------- | :---: | :---: | :---: |
| Submit Donations            |   ✔️  |   –   |   –   |
| AI Item Description         |   ✔️  |   –   |   –   |
| Track Sustainability Impact |   ✔️  |   ✔️  |   ✔️  |
| Manage Incoming Donations   |   –   |   ✔️  |   –   |
| Organisation Management     |   –   |   –   |   ✔️  |
| Staff Management            |   –   |   –   |   ✔️  |
| System Reports              |   –   |   –   |   ✔️  |
| Action Logging              |   –   |   –   |   ✔️  |

---

## Project Setup

### Prerequisites

SustainWear requires the following tools to be installed:

- Node.js (v18 or later)
- npm
- Git

### Installation and Running the Application

Clone the repository:

    git clone https://github.com/koenigone/SustainWear.git

Install backend dependencies:

    cd server
    npm install

Install frontend dependencies:

    cd ../client
    npm install

Configure environment variables:

Create a `.env` file inside the `server` directory and define the required variables using the provided `.env` template.

### Running the Application

The application can be run in both development mode and production preview mode.

Development Mode:

    # Start backend
    cd server
    npm run dev

    # Start frontend
    cd ../client
    npm run dev

Production Preview Mode (Optimised Build):

    # Build the frontend
    cd client
    npm run build

    # Run production preview
    npm run preview

The frontend runs on http://localhost:5173 and the backend API runs on http://localhost:5000.

Production preview mode reflects real deployment behaviour and was used for performance, accessibility, and Lighthouse testing.

---

## Repository Structure

```
/client
  └─ React frontend (pages, components, contexts, API clients, UI logic)

/server
  └─ Express backend (controllers, routes, middleware, services, tests, database)

/Docs
  └─ Supporting documentation (defect reports)
```

This separation ensures maintainability, scalability, and clear responsibility between frontend and backend layers.

---

## Usage Overview

* **Donors** can register, submit donations with images, track their donation status, and view personal sustainability impact.
* **Organisation Staff** can review and process donations, update inventory, and monitor distribution activity.
* **Admins** can manage users and organisations, view system-wide analytics, generate reports, and audit administrative actions.

All features are protected using role-based authentication and authorisation.

---

## Additional Notes

* This repository contains the **working prototype** of SustainWear.
* Detailed design decisions, Agile process evidence, testing strategy, and reflections are documented in the **project portfolio and presentation**, not in this README.
