import { useEffect, useState } from 'react'
import './App.css'

type Balance = {
  totalIncome: number
  totalExpense: number
  balance: number
}

type Transaction = {
  id: number
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string | null
  transactionDate: string
  categoryId: number | null
}

type Category = {
  id: number
  name: string
  type: 'INCOME' | 'EXPENSE'
}

const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(amount) + ' ₽'

function App() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsError, setTransactionsError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/balance').then(response => {
          if (!response.ok) {
            throw new Error('Не удалось загрузить баланс')
          }

          return response.json()
        }).then((data: Balance) => setBalance(data)).catch(() => setError('Не удалось подключиться к backend'))
  }, [])

  useEffect(() => {
    fetch('/api/transactions').then(response => {
          if (!response.ok) {
            throw new Error('Не удалось загрузить операции')
          }

          return response.json()
        }).then((data: Transaction[]) => setTransactions(data)).catch(() => setTransactionsError('Не удалось загрузить операции'))
  }, [])

  useEffect(() => {
    fetch('/api/categories').then(response => {
          if (!response.ok) {
            throw new Error('Не удалось загрузить категории')
          }

          return response.json()
        }).then((data: Category[]) => setCategories(data)).catch(error => console.error(error))
  }, [])

  return (
      <div className="app">
        <header className="header">
          <div className="logo">FinPlan<span>.</span></div>
          <div className="header-label">Личный финансовый планер</div>
        </header>

        <main className="dashboard">
          {error && <p className="expense">{error}</p>}
          <div className="page-heading">
            <div>
              <p className="eyebrow">МОИ ФИНАНСЫ</p>
              <h1>Обзор финансов</h1>
              <p className="subtitle">
                Все доходы и расходы в одном месте
              </p>
            </div>
            <button className="add-button">+ Новая операция</button>
          </div>

          <section className="balance-card">
            <p>Общий баланс</p>
            <h2>{balance ? formatMoney(balance.balance) : 'Загрузка...'}</h2>
            <span>Ваши деньги под контролем</span>
          </section>

          <section className="summary">
            <div className="summary-card">
              <p>Доходы</p>
              <h3 className="income">
                {balance ? '+' + formatMoney(balance.totalIncome) : 'Загрузка...'}
              </h3>
            </div>

            <div className="summary-card">
              <p>Расходы</p>
              <h3 className="expense">
                {balance ? '−' + formatMoney(balance.totalExpense) : 'Загрузка...'}
              </h3>
            </div>
          </section>

          <section className="transactions">
            <div className="section-heading">
              <h2>Последние операции</h2>
              <span>Все операции</span>
            </div>

            {transactionsError && (
                <p className="expense">{transactionsError}</p>
            )}

            {!transactionsError && transactions.length === 0 && (
                <p>Операций пока нет</p>
            )}

            {transactions.map(transaction => (
                <div className="transaction-row" key={transaction.id}>
                  <div>
                    <strong>
                      {categories.find(category => category.id === transaction.categoryId)?.name
                          ?? 'Без категории'}
                    </strong>
                    <p>{transaction.description || 'Без описания'}</p>
                    <p>
                      {new Date(
                          transaction.transactionDate + 'T00:00:00'
                      ).toLocaleDateString('ru-RU')}
                      {' · '}
                      {transaction.type === 'INCOME' ? 'Доход' : 'Расход'}
                    </p>
                  </div>

                  <strong
                      className={
                        transaction.type === 'INCOME' ? 'income' : 'expense'
                      }
                  >
                    {transaction.type === 'INCOME' ? '+' : '−'}
                    {formatMoney(transaction.amount)}
                  </strong>
                </div>
            ))}
          </section>
        </main>
      </div>
  )
}

export default App