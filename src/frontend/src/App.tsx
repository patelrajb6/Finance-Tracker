import { useEffect, useState } from 'react';
import { api, type Transaction, type Budget } from './api';
import './index.css';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<{ Case: string }>({ Case: "Groceries" });
  const [transactionType, setTransactionType] = useState<'Income' | 'Expense'>('Expense');

  // Budget Form State
  const [budgetCategory, setBudgetCategory] = useState('Groceries');
  const [budgetAmount, setBudgetAmount] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [txns, bdgts] = await Promise.all([
        api.getTransactions(),
        api.getBudgets()
      ]);
      setTransactions(txns);
      setBudgets(bdgts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    try {
      await api.createTransaction({
        amount: parseFloat(amount),
        description,
        category: category.Case,
        transactionType
      });
      setAmount('');
      setDescription('');
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to add transaction');
    }
  };

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount) return;

    try {
      const date = new Date();
      await api.setBudget({
        category: budgetCategory,
        amount: parseFloat(budgetAmount),
        month: date.getMonth() + 1,
        year: date.getFullYear()
      });
      setBudgetAmount('');
      loadData();
      alert('Budget set successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to set budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.deleteTransaction(id);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete transaction');
    }
  };

  const totalIncome = transactions
    .filter(t => t.transactionType === 'Income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.transactionType === 'Expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Helper to calculate progress
  const getBudgetProgress = (cat: string) => {
    const budget = budgets.find(b =>
      // Handle "Other: ..." comparison loosely or strictly depending on needs. 
      // For now simple string match.
      b.category === cat
    );
    if (!budget) return null;

    const spent = transactions
      .filter(t => t.transactionType === 'Expense' && t.category === cat)
      .reduce((acc, t) => acc + t.amount, 0);

    const percent = Math.min((spent / budget.amount) * 100, 100);
    return { spent, total: budget.amount, percent };
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>Finance Tracker</h1>
        <p style={{ color: 'var(--color-text-light)' }}>Manage your wealth efficiently</p>
      </header>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Add Transaction Form */}
          <section className="card slide-in">
            <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>

              {/* Type Toggle */}
              <div style={{ display: 'flex', gap: '8px', background: 'var(--color-bg)', padding: '4px', borderRadius: '8px' }}>
                {['Expense', 'Income'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTransactionType(type as any)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: transactionType === type ? 'var(--color-primary)' : 'transparent',
                      color: transactionType === type ? 'white' : 'var(--color-text)',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px' }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Category</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    value={category.Case}
                    onChange={e => setCategory({ Case: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px', background: 'white' }}
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transport">Transport</option>
                    <option value="Other">Other (Custom)</option>
                  </select>
                  {category.Case === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom category"
                      onChange={e => setCategory({ Case: `Other: ${e.target.value}` })}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                  )}
                  {category.Case.startsWith('Other: ') && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                      Custom: <strong>{category.Case.replace('Other: ', '')}</strong>
                      <button type="button" onClick={() => setCategory({ Case: 'Other' })} style={{ marginLeft: '8px', border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Change</button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px' }}
                  placeholder="e.g. Weekly Shop"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                Add {transactionType}
              </button>
            </form>
          </section>

          {/* Set Budget Form */}
          <section className="card slide-in" style={{ animationDelay: '0.1s' }}>
            <h2>Set Monthly Budget</h2>
            <form onSubmit={handleSetBudget} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select
                  value={budgetCategory}
                  onChange={e => setBudgetCategory(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', flex: 1 }}
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other (Custom)</option>
                </select>
                {budgetCategory === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    onChange={e => setBudgetCategory(`Other: ${e.target.value}`)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                )}
                {budgetCategory.startsWith('Other: ') && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                    Custom: <strong>{budgetCategory.replace('Other: ', '')}</strong>
                    <button type="button" onClick={() => setBudgetCategory('Other')} style={{ marginLeft: '8px', border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Change</button>
                  </div>
                )}
              </div>

              <input
                type="number"
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
                placeholder="Budget Amount"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', height: 'fit-content' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 20px', height: 'fit-content' }}>Set</button>
            </form>
          </section>
        </div>

        {/* Main Content */}
        <section>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', color: 'white' }}>
              <span style={{ opacity: 0.8, fontSize: '14px' }}>Net Balance</span>
              <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>
                ${balance.toFixed(2)}
              </div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', color: 'white' }}>
              <span style={{ opacity: 0.8, fontSize: '14px' }}>Total Expenses</span>
              <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>
                ${totalExpense.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          {budgets.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3>Budget Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {budgets.map(b => {
                  const prog = getBudgetProgress(b.category);
                  if (!prog) return null;
                  const isOver = prog.spent > prog.total;

                  return (
                    <div key={b.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 500 }}>{b.category}</span>
                          <button
                            onClick={() => {
                              setBudgetCategory(b.category);
                              setBudgetAmount(b.amount.toString());
                            }}
                            style={{
                              fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                              border: '1px solid var(--color-border)', cursor: 'pointer', background: 'white'
                            }}
                          >
                            Edit
                          </button>
                        </div>
                        <span style={{ color: isOver ? '#e74c3c' : 'var(--color-text-light)' }}>
                          ${prog.spent.toFixed(0)} / ${prog.total.toFixed(0)}
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${prog.percent}%`,
                          height: '100%',
                          background: isOver ? '#e74c3c' : 'var(--color-primary)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease-out'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <h3>Recent Transactions</h3>
            {loading ? <p>Loading...</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {transactions.map(t => (
                  <li key={t.id} className="fade-in" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        background: t.transactionType === 'Income' ? '#e8f5e9' : '#ffebee',
                        color: t.transactionType === 'Income' ? '#2ecc71' : '#e74c3c',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {t.transactionType === 'Income' ? '+' : '$'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.description}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>
                          {t.category} • {new Date(t.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontWeight: 600, color: t.transactionType === 'Income' ? '#2ecc71' : 'var(--color-text)' }}>
                        {t.transactionType === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleDelete(t.id)}
                        style={{
                          background: '#e74c3c', color: 'white',
                          padding: '6px 12px', borderRadius: '6px', fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                {transactions.length === 0 && (
                  <p style={{ color: 'var(--color-text-light)', fontStyle: 'italic', padding: '16px' }}>
                    No transactions yet. Start adding some!
                  </p>
                )}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
