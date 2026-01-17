namespace PersonalFinanceTracker.Domain

open System

// Immutable Domain Models

type Category = 
    | Groceries
    | Utilities
    | Rent
    | Entertainment
    | Transport
    | Other of string

type TransactionType =
    | Income
    | Expense

type Transaction = {
    Id: Guid
    AccountId: Guid
    Amount: decimal
    TransactionType: TransactionType
    Category: Category
    Description: string
    Date: DateTime
    CreatedAt: DateTime
}

type Account = {
    Id: Guid
    Name: string
    Type: string // e.g., "Checking", "Savings"
    InitialBalance: decimal
    CreatedAt: DateTime
}

type Budget = {
    Id: Guid
    Category: Category
    Amount: decimal
    Month: int
    Year: int
}

type MonthlySummary = {
    Month: int
    Year: int
    TotalIncome: decimal
    TotalExpenses: decimal
    CategoryBreakdown: Map<string, decimal>
}

// Module for domain logic
module DomainLogic =
    let createTransaction accountId amount txnType category description date =
        {
            Id = Guid.NewGuid()
            AccountId = accountId
            Amount = amount
            TransactionType = txnType
            Category = category
            Description = description
            Date = date
            CreatedAt = DateTime.UtcNow
        }

    let isOverBudget (budget: Budget) (currentSpent: decimal) =
        currentSpent > budget.Amount
