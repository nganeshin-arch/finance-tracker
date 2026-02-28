import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ConfigurationManager } from './ConfigurationManager.new';
import { CategoryManager } from './CategoryManager.new';
import { UserList } from './UserList';
import { useConfigContext } from '../contexts';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('transaction-types');
  const {
    transactionTypes,
    categories,
    subCategories,
    paymentModes,
    accounts,
    loading,
    addTransactionType,
    deleteTransactionType,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    addPaymentMode,
    deletePaymentMode,
    addAccount,
    deleteAccount,
  } = useConfigContext();

  const tabs = [
    { value: 'transaction-types', label: 'Transaction Types' },
    { value: 'categories', label: 'Categories' },
    { value: 'payment-modes', label: 'Payment Modes' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'user-management', label: 'User Management' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Manage transaction types, categories, payment modes, and accounts
        </p>
      </div>

      {/* Mobile: Dropdown selector */}
      <div className="md:hidden">
        <label htmlFor="admin-tab-select" className="sr-only">
          Select configuration section
        </label>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger 
            id="admin-tab-select"
            className="w-full"
            aria-label="Select configuration section to manage"
          >
            <SelectValue placeholder="Select a section" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem 
                key={tab.value} 
                value={tab.value}
                aria-label={`Switch to ${tab.label} section`}
              >
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop and Mobile: Tab content */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
        aria-label="Admin configuration sections"
      >
        {/* Desktop: Horizontal tabs */}
        <TabsList 
          className="hidden md:inline-flex w-full justify-start border-b rounded-none h-auto p-0 bg-transparent"
          aria-label="Admin configuration navigation tabs"
          role="tablist"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 transition-all"
              aria-label={`${tab.label} tab`}
              aria-controls={`${tab.value}-panel`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent 
            value="transaction-types"
            className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="transaction-types-panel"
            role="tabpanel"
            aria-labelledby="transaction-types-tab"
            tabIndex={0}
          >
            <ConfigurationManager
              title="Transaction Type"
              items={transactionTypes}
              loading={loading}
              onAdd={async (name) => {
                await addTransactionType(name);
              }}
              onDelete={deleteTransactionType}
            />
          </TabsContent>

          <TabsContent 
            value="categories"
            className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="categories-panel"
            role="tabpanel"
            aria-labelledby="categories-tab"
            tabIndex={0}
          >
            <CategoryManager
              transactionTypes={transactionTypes}
              categories={categories}
              subCategories={subCategories}
              loading={loading}
              onAddCategory={async (name, transactionTypeId) => {
                await addCategory(name, transactionTypeId);
              }}
              onUpdateCategory={async (id, name) => {
                await updateCategory(id, name);
              }}
              onDeleteCategory={deleteCategory}
              onAddSubCategory={async (name, categoryId) => {
                await addSubCategory(name, categoryId);
              }}
              onUpdateSubCategory={async (id, name) => {
                await updateSubCategory(id, name);
              }}
              onDeleteSubCategory={deleteSubCategory}
            />
          </TabsContent>

          <TabsContent 
            value="payment-modes"
            className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="payment-modes-panel"
            role="tabpanel"
            aria-labelledby="payment-modes-tab"
            tabIndex={0}
          >
            <ConfigurationManager
              title="Payment Mode"
              items={paymentModes}
              loading={loading}
              onAdd={async (name) => {
                await addPaymentMode(name);
              }}
              onDelete={deletePaymentMode}
            />
          </TabsContent>

          <TabsContent 
            value="accounts"
            className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="accounts-panel"
            role="tabpanel"
            aria-labelledby="accounts-tab"
            tabIndex={0}
          >
            <ConfigurationManager
              title="Account"
              items={accounts}
              loading={loading}
              onAdd={async (name) => {
                await addAccount(name);
              }}
              onDelete={deleteAccount}
            />
          </TabsContent>

          <TabsContent 
            value="user-management"
            className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="user-management-panel"
            role="tabpanel"
            aria-labelledby="user-management-tab"
            tabIndex={0}
          >
            <UserList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
