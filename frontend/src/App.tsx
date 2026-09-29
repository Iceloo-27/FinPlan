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

type OperationDraft = {
    amount: string
    categoryId: string
    description: string
    transactionDate: string
}

const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(amount) + ' ₽'

function App() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsError, setTransactionsError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [operationType, setOperationType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [expenseDraft, setExpenseDraft] = useState<OperationDraft | null>(null)
  const [incomeDraft, setIncomeDraft] = useState<OperationDraft | null>(null)
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)

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

    function getCurrentDraft(): OperationDraft {
        return {amount, categoryId, description, transactionDate,}
    }

    function applyDraft(draft: OperationDraft | null) {
        setAmount(draft?.amount ?? '')
        setCategoryId(draft?.categoryId ?? '')
        setDescription(draft?.description ?? '')
        setTransactionDate(draft?.transactionDate ?? new Date().toLocaleDateString('en-CA'))
    }

    function openCreateModal() {
        setTransactionToEdit(null)
        setOperationType('EXPENSE')
        setAmount('')
        setCategoryId('')
        setExpenseDraft(null)
        setIncomeDraft(null)
        setDescription('')
        setTransactionDate(new Date().toLocaleDateString('en-CA'))
        setSaveError('')
        setIsModalOpen(true)
    }

    function openEditModal(transaction: Transaction) {
        setTransactionToEdit(transaction)

        const draft: OperationDraft = {
            amount: String(transaction.amount),
            categoryId: transaction.categoryId !== null ? String(transaction.categoryId) : '',
            description: transaction.description ?? '',
            transactionDate: transaction.transactionDate,
        }

        setOperationType(transaction.type)
        applyDraft(draft)

        if (transaction.type === 'EXPENSE') {
            setExpenseDraft(draft)
            setIncomeDraft(null)
        } else {
            setIncomeDraft(draft)
            setExpenseDraft(null)
        }

        setSaveError('')
        setIsModalOpen(true)
    }

    async function handleSaveOperation() {
        const parsedAmount = Number(amount)

        if (!Number.isFinite(parsedAmount) || parsedAmount < 0.01) {
            setSaveError('Введите сумму не меньше 0,01')
            return
        }

        if (!transactionDate) {
            setSaveError('Выберите дату')
            return
        }

        setIsSaving(true)
        setSaveError('')

        try {
            const response = await fetch(transactionToEdit ? `/api/transactions/${transactionToEdit.id}` : '/api/transactions',
                {
                    method: transactionToEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parsedAmount,
                    type: operationType,
                    description: description.trim() || null,
                    transactionDate,
                    categoryId: categoryId ? Number(categoryId) : null,
                }),
            })

            if (!response.ok) {
                throw new Error('Не удалось сохранить операцию')
            }

            const [balanceResponse, transactionsResponse] = await Promise.all([
                fetch('/api/balance'),
                fetch('/api/transactions'),
            ])

            if (!balanceResponse.ok || !transactionsResponse.ok) {
                throw new Error('Операция сохранена, но не удалось обновить данные')
            }

            setBalance(await balanceResponse.json())
            setTransactions(await transactionsResponse.json())

            setAmount('')
            setCategoryId('')
            setDescription('')
            setTransactionToEdit(null)
            setIsModalOpen(false)
        } catch (error) {
            setSaveError(
                error instanceof Error ? error.message : 'Произошла ошибка'
            )
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDeleteTransaction(transaction: Transaction) {
        try {
            const response = await fetch(`/api/transactions/${transaction.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Не удалось удалить операцию')
            }

            const [balanceResponse, transactionsResponse] = await Promise.all([
                fetch('/api/balance'),
                fetch('/api/transactions'),
            ])

            if (!balanceResponse.ok || !transactionsResponse.ok) {
                throw new Error('Операция удалена, но не удалось обновить данные')
            }

            setBalance(await balanceResponse.json())
            setTransactions(await transactionsResponse.json())
            setTransactionToDelete(null)
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Произошла ошибка при удалении')
        }
    }

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
              <button className="add-button" onClick={openCreateModal}>
                  + Новая операция
              </button>
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

                    <div className="transaction-actions">
                        <strong
                            className={
                                transaction.type === 'INCOME' ? 'income' : 'expense'
                            }
                        >
                            {transaction.type === 'INCOME' ? '+' : '−'}
                            {formatMoney(transaction.amount)}
                        </strong>

                        <button
                            type="button"
                            className="edit-button"
                            onClick={() => openEditModal(transaction)}
                        >
                            Изменить
                        </button>

                        <button
                            type="button"
                            className="delete-button"
                            onClick={() => setTransactionToDelete(transaction)}
                        >
                            Удалить
                        </button>
                    </div>
                </div>
            ))}
          </section>
        </main>
          {isModalOpen && (
              <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                  <div
                      className="modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="modal-title"
                      onClick={event => event.stopPropagation()}
                  >
                      <div className="modal-heading">
                          <h2 id="modal-title">
                              {transactionToEdit ? 'Редактировать операцию' : 'Новая операция'}
                          </h2>
                          <button
                              className="close-button"
                              type="button"
                              aria-label="Закрыть окно"
                              onClick={() => setIsModalOpen(false)}
                          >
                              ×
                          </button>
                      </div>

                      <div className="operation-form">
                          <div className="type-switch">
                              <button
                                  type="button"
                                  className={operationType === 'EXPENSE' ? 'type-button active' : 'type-button'}
                                  onClick={() => {
                                      if (operationType === 'EXPENSE') {
                                          return
                                      }

                                      setIncomeDraft(getCurrentDraft())
                                      setOperationType('EXPENSE')
                                      applyDraft(expenseDraft)
                                  }}
                              >
                                  Расход
                              </button>

                              <button
                                  type="button"
                                  className={operationType === 'INCOME' ? 'type-button active' : 'type-button'}
                                  onClick={() => {
                                      if (operationType === 'INCOME') {
                                          return
                                      }

                                      setExpenseDraft(getCurrentDraft())
                                      setOperationType('INCOME')
                                      applyDraft(incomeDraft)
                                  }}
                              >
                                  Доход
                              </button>
                          </div>

                          <label className="form-field">
                              Сумма
                              <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={amount}
                                  onChange={event => setAmount(event.target.value)}
                              />
                          </label>

                          <label className="form-field">
                              Категория
                              <select
                                  value={categoryId}
                                  onChange={event => setCategoryId(event.target.value)}
                              >
                                  <option value="">Без категории</option>
                                  {categories
                                      .filter(category => category.type === operationType)
                                      .map(category => (
                                          <option key={category.id} value={category.id}>
                                              {category.name}
                                          </option>
                                      ))}
                              </select>
                          </label>

                          <label className="form-field">
                              Описание
                              <input
                                  type="text"
                                  maxLength={255}
                                  placeholder="Например, покупка продуктов"
                                  value={description}
                                  onChange={event => setDescription(event.target.value)}
                              />
                          </label>

                          <label className="form-field">
                              Дата
                              <input
                                  type="date"
                                  value={transactionDate}
                                  onChange={event => setTransactionDate(event.target.value)}
                              />
                          </label>

                          {saveError && <p className="expense">{saveError}</p>}

                          <button
                              className="save-button"
                              type="button"
                              disabled={isSaving}
                              onClick={handleSaveOperation}
                          >
                              {isSaving ? 'Сохраняем...' : transactionToEdit ? 'Сохранить изменения' : 'Сохранить операцию'}
                          </button>
                      </div>
                  </div>
              </div>
          )}
          {transactionToDelete && (
              <div
                  className="modal-backdrop"
                  onClick={() => setTransactionToDelete(null)}
              >
                  <div
                      className="modal delete-modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="delete-modal-title"
                      onClick={event => event.stopPropagation()}
                  >
                      <div className="modal-heading">
                          <h2 id="delete-modal-title">Удалить операцию?</h2>

                          <button
                              className="close-button"
                              type="button"
                              aria-label="Закрыть окно"
                              onClick={() => setTransactionToDelete(null)}
                          >
                              ×
                          </button>
                      </div>

                      <p className="delete-message">
                          Вы действительно хотите удалить{' '}
                          {transactionToDelete.type === 'INCOME' ? 'доход' : 'расход'} на{' '}
                          <strong
                              className={
                                  transactionToDelete.type === 'INCOME'
                                      ? 'income'
                                      : 'expense'
                              }
                          >
                              {formatMoney(transactionToDelete.amount)}
                          </strong>
                          ?
                      </p>

                      <div className="delete-modal-actions">
                          <button
                              type="button"
                              className="cancel-button"
                              onClick={() => setTransactionToDelete(null)}
                          >
                              Отмена
                          </button>

                          <button
                              type="button"
                              className="confirm-delete-button"
                              onClick={() => handleDeleteTransaction(transactionToDelete)}
                          >
                              Удалить
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  )
}

export default App