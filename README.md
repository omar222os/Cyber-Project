# 🛡️ Corporate Directory - SQL Injection (SQLi) Lab

> **⚠️ DISCLAIMER:** This project contains intentionally vulnerable code designed strictly for educational purposes and cybersecurity demonstrations. **Do not** deploy this application in a production environment or expose it to the public internet.

## 📖 Overview
This project is an interactive, full-stack laboratory environment built to demonstrate **In-Band SQL Injection (SQLi)** vulnerabilities. It features a mock corporate web application containing two primary attack surfaces:
1. **Authentication Bypass:** Exploiting an insecure login portal to access an admin session.
2. **Data Extraction:** Utilizing Error-Based and UNION-Based SQLi to extract hidden database records (such as passwords and salaries) from a searchable employee directory.

The application includes both **vulnerable** and **secure** API endpoints side-by-side to highlight the critical importance of parameterized queries (prepared statements) in secure software development.

---

## 🛠️ Tech Stack & Architecture
- **Frontend:** Vanilla HTML, CSS (Bootstrap 5), JavaScript (Fetch API)
- **Web Server:** Nginx (Alpine) with custom routing (`default.conf`)
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8.0
- **Orchestration:** Docker & Docker Compose

---

## 🚀 Installation & Setup

Ensure you have [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd <YOUR_PROJECT_FOLDER>
