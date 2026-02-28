import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import { ConfigurationManager } from './ConfigurationManager';
import { CategoryManager } from './CategoryManager';
import { UserList } from './UserList';
import { useConfigContext } from '../contexts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Configuration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage transaction types, categories, payment modes, and accounts
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="admin configuration tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Transaction Types" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
          <Tab label="Categories" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
          <Tab label="Payment Modes" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
          <Tab label="Accounts" id="admin-tab-3" aria-controls="admin-tabpanel-3" />
          <Tab label="User Management" id="admin-tab-4" aria-controls="admin-tabpanel-4" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <ConfigurationManager
              title="Transaction Type"
              items={transactionTypes}
              loading={loading}
              onAdd={async (name) => {
                await addTransactionType(name);
              }}
              onDelete={deleteTransactionType}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
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
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <ConfigurationManager
              title="Payment Mode"
              items={paymentModes}
              loading={loading}
              onAdd={async (name) => {
                await addPaymentMode(name);
              }}
              onDelete={deletePaymentMode}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <ConfigurationManager
              title="Account"
              items={accounts}
              loading={loading}
              onAdd={async (name) => {
                await addAccount(name);
              }}
              onDelete={deleteAccount}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <UserList />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};
