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

type CategoryExpense = {
    categoryId: number | null
    categoryName: string
    totalExpense: number
}

const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(amount) + ' ₽'

function App() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [periodBalance, setPeriodBalance] = useState<Balance | null>(null)
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([])
  const [analyticsError, setAnalyticsError] = useState('')
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleDateString('en-CA').slice(0, 7))
  const [selectedType, setSelectedType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [periodMode, setPeriodMode] = useState<'ALL_TIME' | 'MONTH'>('MONTH')

    async function loadTransactions() {
        let url = '/api/transactions'

        if (periodMode === 'MONTH') {
            const [year, month] = selectedMonth.split('-')

            url = `/api/transactions/monthly?year=${year}&month=${Number(month)}`

            if (selectedType !== 'ALL') {
                url += `&type=${selectedType}`
            }
        }

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Не удалось загрузить операции')
        }

        let data: Transaction[] = await response.json()

        if (periodMode === 'ALL_TIME' && selectedType !== 'ALL') {
            data = data.filter(transaction => transaction.type === selectedType)
        }

        setTransactions(data)
        setTransactionsError('')
    }

    async function loadPeriodBalance() {
        let url = '/api/balance'

        if (periodMode === 'MONTH') {
            const [year, month] = selectedMonth.split('-')

            url = `/api/balance/monthly?year=${year}&month=${Number(month)}`
        }

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Не удалось загрузить данные за период')
        }

        const data: Balance = await response.json()
        setPeriodBalance(data)
    }

    async function loadCategoryExpenses() {
        let url = '/api/analytics/expenses-by-category'

        if (periodMode === 'MONTH') {
            const [year, month] = selectedMonth.split('-')
            url = `/api/analytics/expenses-by-category/monthly?year=${year}&month=${Number(month)}`
        }

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Не удалось загрузить аналитику')
        }

        const data: CategoryExpense[] = await response.json()

        setCategoryExpenses(data)
        setAnalyticsError('')
    }

    useEffect(() => {
    fetch('/api/balance').then(response => {
          if (!response.ok) {
            throw new Error('Не удалось загрузить баланс')
          }

          return response.json()
        }).then((data: Balance) => setBalance(data)).catch(() => setError('Не удалось подключиться к backend'))
    }, [])

    useEffect(() => {
        let url = '/api/balance'

        if (periodMode === 'MONTH') {
            const [year, month] = selectedMonth.split('-')

            url = `/api/balance/monthly?year=${year}&month=${Number(month)}`
        }

        fetch(url).then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные за период')
                }

                return response.json()
            }).then((data: Balance) => {
                setPeriodBalance(data)
            }).catch(error => {
                console.error(error)
            })
    }, [periodMode, selectedMonth])

    useEffect(() => {
        let url = '/api/analytics/expenses-by-category'

        if (periodMode === 'MONTH') {
            const [year, month] = selectedMonth.split('-')
            url = `/api/analytics/expenses-by-category/monthly?year=${year}&month=${Number(month)}`
        }

        fetch(url).then(response => {
            if (!response.ok) {
                throw new Error('Не удалось загрузить аналитику')
            }

            return response.json()
        }).then((data: CategoryExpense[]) => {
            setCategoryExpenses(data)
            setAnalyticsError('')
        }).catch(() => {
            setCategoryExpenses([])
            setAnalyticsError('Не удалось загрузить аналитику')
        })
    }, [periodMode, selectedMonth])

    useEffect(() => {
        let url = '/api/transactions'

        if (periodMode === 'MONTH') {
            const [year, month] = selectedMonth.split('-')

            url = `/api/transactions/monthly?year=${year}&month=${Number(month)}`

            if (selectedType !== 'ALL') {
                url += `&type=${selectedType}`
            }
        }

        fetch(url).then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить операции')
                }

                return response.json()
            }).then((data: Transaction[]) => {
                const filteredData = periodMode === 'ALL_TIME' && selectedType !== 'ALL' ? data.filter(transaction => transaction.type === selectedType) : data

                setTransactions(filteredData)
                setTransactionsError('')
            }).catch(() => {
                setTransactionsError('Не удалось загрузить операции')
            })
    }, [selectedMonth, selectedType, periodMode])

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

            const balanceResponse = await fetch('/api/balance')

            if (!balanceResponse.ok) {
                throw new Error('Операция сохранена, но не удалось обновить баланс')
            }

            setBalance(await balanceResponse.json())
            await loadTransactions()
            await loadPeriodBalance()
            await loadCategoryExpenses()

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

            const balanceResponse = await fetch('/api/balance')

            if (!balanceResponse.ok) {
                throw new Error('Операция удалена, но не удалось обновить баланс')
            }

            setBalance(await balanceResponse.json())
            await loadTransactions()
            await loadPeriodBalance()
            await loadCategoryExpenses()

            setTransactionToDelete(null)
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Произошла ошибка при удалении')
        }
    }

    const selectedMonthLabel = new Intl.DateTimeFormat('ru-RU', {month: 'long', year: 'numeric',}).format(new Date(`${selectedMonth}-01T00:00:00`)).replace(' г.', '')

    function changeMonth(offset: number) {
        const [year, month] = selectedMonth.split('-').map(Number)

        const date = new Date(year, month - 1 + offset, 1)

        const nextYear = date.getFullYear()
        const nextMonth = String(date.getMonth() + 1).padStart(2, '0')

        setSelectedMonth(`${nextYear}-${nextMonth}`)
    }

    const totalCategoryExpenses = categoryExpenses.reduce(
        (total, category) => total + category.totalExpense,
        0
    )

    function getCategoryPercentage(amount: number) {
        if (totalCategoryExpenses === 0) {
            return 0
        }

        return Math.round((amount / totalCategoryExpenses) * 100)
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
                <span className="summary-period">
                {periodMode === 'ALL_TIME' ? 'за всё время' : `за ${selectedMonthLabel}`}
                </span>
                <h3 className="income">
                    {periodBalance ? '+' + formatMoney(periodBalance.totalIncome) : 'Загрузка...'}
                </h3>
              </div>
              <div className="summary-card">
                <p>Расходы</p>
                    <span className="summary-period">
                        {periodMode === 'ALL_TIME' ? 'за всё время' : `за ${selectedMonthLabel}`}
                    </span>
                    <h3 className="expense">
                        {periodBalance ? '−' + formatMoney(periodBalance.totalExpense) : 'Загрузка...'}
                    </h3>
              </div>
          </section>

          <section className="analytics-card">
                <div className="analytics-heading">
                    <div>
                        <p className="eyebrow">АНАЛИТИКА</p>
                        <h2>Расходы по категориям</h2>
                    </div>

                    <span className="analytics-period">
                        {periodMode === 'ALL_TIME' ? 'За всё время' : selectedMonthLabel}
                    </span>
                </div>

                {analyticsError && (
                    <p className="expense">{analyticsError}</p>
                )}

                {!analyticsError && categoryExpenses.length === 0 && (
                    <p className="analytics-empty">
                        Расходов за этот период пока нет
                    </p>
                )}

                {!analyticsError && categoryExpenses.length > 0 && (
                    <div className="category-list">
                        {categoryExpenses.map(category => {
                            const percentage = getCategoryPercentage(category.totalExpense)

                            return (
                                <div
                                    className="category-item"
                                    key={category.categoryId ?? 'uncategorized'}
                                >
                                    <div className="category-info">
                                        <strong>{category.categoryName}</strong>

                                        <div>
                                            <span>{formatMoney(category.totalExpense)}</span>
                                            <span className="category-percentage">
                                                {percentage}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="category-bar">
                                        <div
                                            className="category-bar-fill"
                                            style={{ width: `${percentage}%` }}
                                        />
                                        </div>
                                    </div>
                            )
                        })}
                    </div>
                )}
          </section>

          <section className="transactions">
              <div className="section-heading">
                  <h2>Операции</h2>

                  <div className="period-filter">
                      <button
                          type="button"
                          className={
                              periodMode === 'ALL_TIME'
                                  ? 'period-button active'
                                  : 'period-button'
                          }
                          onClick={() => setPeriodMode('ALL_TIME')}
                      >
                          Всё время
                      </button>

                      <button
                          type="button"
                          className={
                              periodMode === 'MONTH'
                                  ? 'period-button active'
                                  : 'period-button'
                          }
                          onClick={() => setPeriodMode('MONTH')}
                      >
                          Месяц
                      </button>
                  </div>
                  <div
                      className={periodMode === 'MONTH' ? 'month-navigation' : 'month-navigation hidden'}
                  >
                      <button
                          type="button"
                          className="month-arrow"
                          onClick={() => changeMonth(-1)}
                          aria-label="Предыдущий месяц"
                      >
                          ‹
                      </button>

                      <span className="month-label">
                          {selectedMonthLabel}
                      </span>

                      <button
                          type="button"
                          className="month-arrow"
                          onClick={() => changeMonth(1)}
                          aria-label="Следующий месяц"
                      >
                          ›
                      </button>
                  </div>

              </div>
              <div className="transaction-filters">
                  <button
                      type="button"
                      className={selectedType === 'ALL' ? 'filter-button active' : 'filter-button'}
                      onClick={() => setSelectedType('ALL')}
                  >
                      Все
                  </button>

                  <button
                      type="button"
                      className={selectedType === 'INCOME' ? 'filter-button active' : 'filter-button'}
                      onClick={() => setSelectedType('INCOME')}
                  >
                      Доходы
                  </button>

                  <button
                      type="button"
                      className={selectedType === 'EXPENSE' ? 'filter-button active' : 'filter-button'}
                      onClick={() => setSelectedType('EXPENSE')}
                  >
                      Расходы
                  </button>
              </div>
            <div className="transactions-list">
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
            </div>
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