# RBTC-IMS: Therapeutic Community Management System

A secure, Single Page Application (SPA) built to manage patient records, inventory, and billing for the **RBTC Therapeutic Community**.

**Tech Stack:** * **Backend:** Laravel 12 (PHP)

* **Frontend:** React 19 + Tailwind CSS
* **Bridge:** Inertia.js (The Modern Monolith)
* **Server:** XAMPP (Apache + MySQL)

---

## 🛠 Prerequisites

* **XAMPP**: For Apache and MySQL.
* **Node.js (v22.12.0+)**: Essential for Vite and React compilation.
* **Composer**: For PHP dependency management.
* **Git**: To push and pull code from the repository.
* **VS Code**: Recommended extensions: *ESLint*, *Prettier*, and *PHP Intelephense*.

> **🚨 Important for Windows Users:** > If you encounter "Permission Denied" errors when running commands, you **must** run VS Code as **Administrator**. Right-click the VS Code icon > "Run as administrator."

---

## 🚀 First-Time Setup (New Team Members)

After cloning the repository for the first time, run these steps in order:

1. **Install Dependencies:**
```bash
composer install
npm install

```


2. **Environment Configuration:**
* Create a new database in XAMPP (PHPMyAdmin) named `rbtc_ims`.
* Copy `.env.example` to a new file named `.env`.
* Open `.env` and update the `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` lines.


3. **Generate Security Key:**
```bash
php artisan key:generate

```


4. **Build Database Structure:**
```bash
php artisan migrate

```



---

## 💻 Daily Development Workflow

In a team environment, code and database structures change daily. Follow this loop every time you start working:

### 1. The "Sync" Sequence (Run once per day)

Before writing code, make sure your local environment matches the team's latest work:

```powershell
git pull origin main       # Get newest code
composer install           # Get new PHP packages
npm install               # Get new React tools
php artisan migrate        # Sync your database tables

```

### 2. The "Running" Sequence (Keep these open)

You need **two terminal tabs** running simultaneously to view the app:

* **Tab A:** `php artisan serve` (Powers the logic/database)
* **Tab B:** `npm run dev` (Powers the React UI and CSS)

---

## 📂 Project Structure & Modification Guide

| Folder Path | Description | When to modify? |
| --- | --- | --- |
| **`app/Models`** | Database object definitions. | When adding new data fields. |
| **`app/Http/Controllers`** | Backend logic & data fetching. | **Very Frequent** - When building features. |
| **`database/migrations`** | Database "blueprints." | When creating/altering SQL tables. |
| **`resources/js/Pages`** | The actual React screens. | **Very Frequent** - Designing the UI. |
| **`resources/js/Components`** | Reusable UI (Buttons, Cards). | When creating shared design elements. |
| **`resources/js/Layouts`** | The "Shell" (Sidebar/Navbar). | To change the general app layout. |
| **`routes/web.php`** | URL definitions. | When adding a new page or link. |

---

## 🌿 Team Collaboration (Git Policy)

* **No direct pushes to `main**`: Always create a feature branch.
```bash
git checkout -b feature/patient-registration

```


* **Database Rule**: Never edit an old migration file that has already been pushed to GitHub. Always create a **new** migration if you need to add or change a column.
* **The `.env` Rule**: Never commit your `.env` file. It contains your local database passwords and unique security keys.

