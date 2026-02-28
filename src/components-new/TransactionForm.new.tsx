import { useState } from 'react';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  onSubmit: (data: any) => void;
  transactionTypes: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string; transactionTypeId: number }>;
  subCategories: Array<{ id: number; name: string; categoryId: number }>;
  paymentModes: Array<{ id: number; name: string }>;
  accounts: Array<{ id: number; name: string }>;
}

const TransactionForm = ({
  onSubmit,
  transactionTypes,
  categories,
  subCategories,
  paymentModes,
  accounts,
}: TransactionFormProps) => {
  const [transactionTypeId, setTransactionTypeId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subCategoryId, setSubCategoryId] = useState<number | ''>('');
  const [paymentModeId, setPaymentModeId] = useState<number | ''>('');
  const [accountId, setAccountId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredCategories = transactionTypeId
    ? categories.filter((c) => c.transactionTypeId === transactionTypeId)
    : [];

  const filteredSubCategories = categoryId
    ? subCategories.filter((s) => s.categoryId === categoryId)
    : [];

  const handleTypeChange = (id: number) => {
    setTransactionTypeId(id);
    setCategoryId('');
    setSubCategoryId('');
  };

  const handleCategoryChange = (id: number) => {
    setCategoryId(id);
    setSubCategoryId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionTypeId || !categoryId || !subCategoryId || !amount) return;

    onSubmit({
      date,
      transactionTypeId,
      categoryId,
      subCategoryId,
      paymentModeId,
      accountId,
      amount: parseFloat(amount),
      description: description.trim(),
    });

    // Reset form
    setAmount('');
    setDescription('');
  };

  const getTypeColor = (typeName: string) => {
    if (typeName === 'Income') return 'bg-green-600 hover:bg-green-700 text-white';
    if (typeName === 'Expense') return 'bg-red-600 hover:bg-red-700 text-white';
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5 shadow-sm">
      <h2 className="font-bold text-lg text-gray-900 dark:text-white">Add Transaction</h2>

      {/* Type selector as pills */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
          Type
        </label>
        <div className="flex gap-2 flex-wrap">
          {transactionTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeChange(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                transactionTypeId === type.id
                  ? getTypeColor(type.name)
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            disabled={!transactionTypeId}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            <option value="">Select category</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-category */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Sub-category
          </label>
          <select
            value={subCategoryId}
            onChange={(e) => setSubCategoryId(Number(e.target.value))}
            disabled={!categoryId}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            <option value="">Select sub-category</option>
            {filteredSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Mode */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Payment Mode
          </label>
          <select
            value={paymentModeId}
            onChange={(e) => setPaymentModeId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select mode</option>
            {paymentModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Account
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Amount
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Description
          </label>
          <input
            type="text"
            placeholder="Brief note..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Plus className="w-4 h-4" />
        Add Transaction
      </button>
    </form>
  );
};

export default TransactionForm;
