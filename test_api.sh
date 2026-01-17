#!/bin/bash

# Default port - adjust if your dotnet run output says otherwise (e.g. 5000, 5001, 7198)
BASE_URL="http://localhost:5000"

echo "Testing API at $BASE_URL"

# 1. Create a Transaction
echo "Creating a transaction..."
curl -v -X POST "$BASE_URL/Transaction" \
     -H "Content-Type: application/json" \
     -d '{
           "AccountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
           "Amount": 50.00,
           "TransactionType": "Expense",
           "Category": "Groceries",
           "Description": "Weekly groceries",
           "Date": "2023-10-27T10:00:00Z"
         }'

echo -e "\n\n"

# 2. Get All Transactions
echo "Getting all transactions..."
curl -v "$BASE_URL/Transaction"

echo -e "\nDone."
