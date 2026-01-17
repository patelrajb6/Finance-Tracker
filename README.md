# Personal Finance Tracker

A robust, modern Personal Finance Tracker application built with a functional-first backend and a responsive React frontend.

## 🚀 Overview

This project demonstrates a full-stack application architecture combining the safety and conciseness of **F#** with the interactive power of **React**. It is designed to track expenses, manage budgets (planned), and provide visual monthly summaries.

Key highlights include:
*   **Domain-Driven Design (DDD)** with F# immutable types.
*   **Clean Architecture** separating Domain, Data, and API layers.
*   **Infrastructure as Code (IaC)** using Azure Bicep.
*   **CI/CD** pipelines via GitHub Actions.
*   **Premium UI** with custom Vanilla CSS variables and animations.

## 🛠 Tech Stack

### Backend
*   **Language**: F# (dotnet 8.0)
*   **Framework**: ASP.NET Core Web API
*   **Database**: PostgreSQL (Production) / In-Memory (Dev/Demo)
*   **Data Access**: Dapper & Npgsql
*   **Serialization**: System.Text.Json (customized for F#)

### Frontend
*   **Framework**: React (TypeScript)
*   **Tooling**: Vite
*   **Styling**: Vanilla CSS (Variables, Flexbox/Grid, Glassmorphism)

### DevOps & Cloud
*   **Cloud Provider**: Azure (App Service, Database for PostgreSQL, Service Bus)
*   **IaC**: Azure Bicep
*   **CI/CD**: GitHub Actions

## 📂 Project Structure

```
├── src
│   ├── PersonalFinanceTracker.Domain   # Core business logic & immutable types
│   ├── PersonalFinanceTracker.Data     # Repositories & Database access
│   ├── PersonalFinanceTracker.Api      # REST API Controllers & Configuration
│   └── frontend                        # React + Vite application
├── infra                               # Azure Bicep templates
├── db                                  # SQL Migration scripts
└── .github/workflows                   # CI/CD definitions
```

## ⚡ Getting Started

### Prerequisites
*   [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
*   [Node.js](https://nodejs.org/) (v18+)

### 1. Run the Backend
The backend is configured to use an **In-Memory Store** by default for immediate testing without a database setup.

```bash
# Navigate to the root
dotnet build

# Run the API (Ensure it binds to port 5000)
dotnet run --project src/PersonalFinanceTracker.Api/PersonalFinanceTracker.Api.fsproj --urls "http://localhost:5000"
```
*API will be available at `http://localhost:5000/Transaction`*

### 2. Run the Frontend
Open a new terminal window.

```bash
cd src/frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```
*Frontend will run at `http://localhost:5173` (or similar)*

## ✨ Features

*   **Add Transactions**: Record expenses with categories (Groceries, Rent, etc.) and descriptions.
*   **View History**: See a chronological list of all transactions.
*   **Delete Entries**: Remove incorrect transaction entries.
*   **Real-time Balance**: "Total Expenses" card updates instantly as you modify data.
*   **Responsive Design**: Works on desktop and mobile.

## 📦 Deployment

### Azure Resources
The `infra/` folder contains Bicep files to provision:
*   Azure App Service (Free Tier)
*   Azure Database for PostgreSQL
*   Azure Service Bus (Namespace & Queue)

### GitHub Actions
The `.github/workflows/deploy.yml` pipeline handles:
1.  Building the .NET solution.
2.  Running Unit Tests.
3.  Validating Bicep Infrastructure templates.

## 📄 License
MIT
