# System Workflow & Architecture

This document visualizes the architecture and data flow of the Personal Finance Tracker.

## 1. High-Level Architecture

This diagram shows how the User interacts with the Frontend, which communicates with the Backend API, eventually reaching the Data layer and External Services (Azure).

```mermaid
graph TD
    User((User))
    
    subgraph Frontend [React + Vite]
        UI[User Interface]
        ApiClient[API Client (api.ts)]
    end
    
    subgraph Backend [F# ASP.NET Core]
        Controller[TransactionController]
        DTO[DTO Layer]
        Domain[Domain Logic (Pure F#)]
        RepoInterface[ITransactionRepository]
        
        subgraph DataAccess
            InMemoryRepo[In-Memory Repository]
            PostgresRepo[PostgreSQL Repository]
        end
    end
    
    subgraph Infrastructure [Azure]
        DB[(PostgreSQL Database)]
        ServiceBus[Azure Service Bus]
    end

    User -->|Interacts| UI
    UI -->|Calls| ApiClient
    ApiClient -->|HTTP JSON| Controller
    
    Controller -->|Maps| DTO
    DTO -->|Converts to| Domain
    Controller -->|Uses| RepoInterface
    
    RepoInterface -->|Impl| InMemoryRepo
    RepoInterface -->|Impl| PostgresRepo
    
    PostgresRepo -->|SQL Query| DB
    Controller -.->|Publish Event| ServiceBus
```

## 2. "Add Transaction" Workflow

This sequence diagram details the step-by-step process when a user adds a new transaction.

```mermaid
sequenceDiagram
    participant User
    participant React as React Frontend
    participant API as F# API (Controller)
    participant Domain as Domain Layer
    participant Repo as Repository (In-Memory/DB)

    User->>React: Enters Amount, Category, Description
    User->>React: Clicks "Add Transaction"
    
    React->>React: Validates Input
    React->>API: POST /Transaction (JSON payload)
    
    Note over API: Payload: { accountId, amount, ... }
    
    API->>API: Map JSON -> CreateTransactionRequest
    API->>Domain: Map to Transaction Record (Immutable)
    API->>Repo: Create(transaction)
    
    Repo-->>API: Success (Task completed)
    
    API-->>React: 201 Created (returns full TransactionDTO)
    
    React->>React: Updates State (Transactions List)
    React-->>User: Shows new Transaction in List
    React-->>User: Updates Total Balance
```

## 3. "Delete Transaction" Workflow

```mermaid
sequenceDiagram
    participant User
    participant React as React Frontend
    participant API as F# API
    participant Repo as Repository

    User->>React: Clicks "Delete" button
    User->>React: Confirms Dialog
    
    React->>API: DELETE /Transaction/{id}
    
    API->>Repo: Delete(id)
    Repo-->>API: Success
    
    API-->>React: 204 No Content
    
    React->>React: Removes item from State
    React-->>User: List updates immediately
```
