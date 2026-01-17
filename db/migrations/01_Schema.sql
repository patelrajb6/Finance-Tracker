-- 01_Schema.sql

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    amount DECIMAL(18, 2) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'Income' or 'Expense'
    category TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY,
    category TEXT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    UNIQUE(category, month, year)
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
