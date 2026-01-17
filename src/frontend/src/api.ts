export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  transactionType: 'Income' | 'Expense';
  category: string;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface SetBudgetRequest {
  category: string;
  amount: number;
  month: number;
  year: number;
}

const BASE_URL = 'http://localhost:5000';

export const api = {
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await fetch(`${BASE_URL}/Transaction`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  createTransaction: async (txn: Partial<Transaction>): Promise<void> => {
    const res = await fetch(`${BASE_URL}/Transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...txn,
        // Defaults
        accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        date: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error('Failed to create transaction');
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/Transaction/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
  },

  getBudgets: async (): Promise<Budget[]> => {
    const res = await fetch(`${BASE_URL}/Budget`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  setBudget: async (req: SetBudgetRequest): Promise<void> => {
    const res = await fetch(`${BASE_URL}/Budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('Failed to set budget');
  }
};
