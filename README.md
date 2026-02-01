# RBTC-IMS: Therapeutic Community Management System

A secure, Single Page Application (SPA) built to manage patient records, inventory, and billing for the **RBTC Therapeutic Community**.

**Tech Stack:** * **Backend:** Laravel 12 (PHP) 

* **Frontend:** React 19 + Tailwind CSS
* **Bridge:** Inertia.js (The Modern Monolith)
* 
**Database:** MySQL with Foreign Key integrity 


* **Security:** CipherSweet (Searchable Encryption) + Sodium

---

## ⚙️ Mandatory PHP Configuration

Before running the application, you **must** enable the following extensions in your XAMPP settings for the encryption to work:

1. Open **XAMPP Control Panel**.
2. Click **Config** next to Apache > **PHP (php.ini)**.
3. Find and remove the semicolon (`;`) from the start of these lines:
* `extension=sodium`
* `extension=intl`
* `extension=zip`
* `extension=fileinfo`
* `extension=openssl`
* `extension=pdo_mysql`    


4. **Save and Restart Apache.**

---

## 🚀 First-Time Setup

1. **Install Dependencies:**
Download composer from Google and npm:
Composer:
https://getcomposer.org/download/ 

Npm or node.js:
https://nodejs.org/en/download

```bash
composer install
npm install
php artisan ciphersweet:generate-key # IMPORTANT: Copy this output to .env!
```


2. **Environment:** * Create a database named `rbtc_ims` in PHPMyAdmin.
* Copy `.env.example` to `.env` and update your database credentials.
```
Default example of database credentials:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rbtc_ims
DB_USERNAME=root
DB_PASSWORD=
```



3. **Generate Keys & Migrate:**
```bash
php artisan key:generate
php artisan migrate:fresh --seed

```



---

## 💻 Daily Development Workflow

### 1. The "Sync" Sequence

Run this every morning to match the team's latest work:

```powershell
git pull origin main             # Get newest code
composer install                 # Get new PHP packages
npm install                      # Get new React tools
[cite_start]php artisan migrate              # Apply any new table changes [cite: 7]

```

### 2. Running the App

Keep **two terminals** open:

* 
**Terminal A:** `php artisan serve` (Powers the logic/database) 


* 
**Terminal B:** `npm run dev` (Powers the React UI) 



---

## 📂 Project Structure Guide

| Folder Path | Description | When to modify? |
| --- | --- | --- |
| **`app/Models`** | Database objects 

 | Adding new data fields. |
| **`app/Http/Controllers`** | Backend & Search logic | Building features/encryption logic. |
| **`database/migrations`** | Table Blueprints 

 | Altering SQL structures. |
| **`resources/js/Pages`** | React Screens | Designing new pages. |
| **`resources/js/Components`** | Reusable UI | Creating shared elements (Buttons, Cards). |
