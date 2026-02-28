import pool from '../config/database';

async function seedData() {
  try {
    console.log('Starting database seeding...\n');

    // Seed transaction types
    console.log('▶️  Seeding transaction types...');
    await pool.query(`
      INSERT INTO transaction_types (name) VALUES
        ('Income'),
        ('Expense'),
        ('Transfer')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Transaction types seeded\n');

    // Get transaction type IDs
    const typeResult = await pool.query('SELECT id, name FROM transaction_types');
    const incomeTypeId = typeResult.rows.find(t => t.name === 'Income')?.id;
    const expenseTypeId = typeResult.rows.find(t => t.name === 'Expense')?.id;
    const transferTypeId = typeResult.rows.find(t => t.name === 'Transfer')?.id;

    // Seed income categories
    console.log('▶️  Seeding income categories...');
    await pool.query(`
      INSERT INTO categories (name, transaction_type_id) VALUES
        ('Salary', $1),
        ('Salary_BetterHalf', $1),
        ('Business/Profession', $1),
        ('Investments', $1),
        ('Rental', $1),
        ('Pension & Benefits', $1),
        ('Financial Transfers', $1),
        ('Other Income', $1)
      ON CONFLICT (name, transaction_type_id) DO NOTHING;
    `, [incomeTypeId]);
    console.log('✅ Income categories seeded\n');

    // Seed expense categories
    console.log('▶️  Seeding expense categories...');
    await pool.query(`
      INSERT INTO categories (name, transaction_type_id) VALUES
        ('Clothing', $1),
        ('Education', $1),
        ('Entertainment', $1),
        ('Family_Social', $1),
        ('Financial', $1),
        ('Food_Dining', $1),
        ('Groceries', $1),
        ('Healthcare', $1),
        ('Household', $1),
        ('Housing', $1),
        ('Insurance', $1),
        ('Investments', $1),
        ('Loan', $1),
        ('Miscellaneous', $1),
        ('ParentsExpenses', $1),
        ('PersonalCare', $1),
        ('PersonalDevelopment', $1),
        ('Savings', $1),
        ('Tax', $1),
        ('Transportation', $1),
        ('Travel', $1),
        ('Utilities', $1)
      ON CONFLICT (name, transaction_type_id) DO NOTHING;
    `, [expenseTypeId]);
    console.log('✅ Expense categories seeded\n');

    // Seed transfer categories
    console.log('▶️  Seeding transfer categories...');
    await pool.query(`
      INSERT INTO categories (name, transaction_type_id) VALUES
        ('Account Transfer', $1),
        ('Savings Transfer', $1),
        ('Investment Transfer', $1),
        ('Loan Payment', $1),
        ('Credit Card Payment', $1)
      ON CONFLICT (name, transaction_type_id) DO NOTHING;
    `, [transferTypeId]);
    console.log('✅ Transfer categories seeded\n');

    // Get category IDs for sub-categories
    const categoryResult = await pool.query('SELECT id, name FROM categories');
    const getCategoryId = (name: string) => categoryResult.rows.find(c => c.name === name)?.id;

    // Seed sub-categories for Food & Dining
    console.log('▶️  Seeding sub-categories...');
    const foodCategoryId = getCategoryId('Food & Dining');
    if (foodCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Groceries', $1),
          ('Restaurants', $1),
          ('Fast Food', $1),
          ('Coffee & Tea', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [foodCategoryId]);
    }

    // Seed sub-categories for Transportation
    const transportCategoryId = getCategoryId('Transportation');
    if (transportCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Fuel', $1),
          ('Public Transport', $1),
          ('Taxi & Ride Share', $1),
          ('Vehicle Maintenance', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [transportCategoryId]);
    }

    // Seed sub-categories for Shopping
    const shoppingCategoryId = getCategoryId('Shopping');
    if (shoppingCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Clothing', $1),
          ('Electronics', $1),
          ('Home & Garden', $1),
          ('Gifts', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [shoppingCategoryId]);
    }

    // Seed sub-categories for Entertainment
    const entertainmentCategoryId = getCategoryId('Entertainment');
    if (entertainmentCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Movies & Shows', $1),
          ('Games', $1),
          ('Sports', $1),
          ('Hobbies', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [entertainmentCategoryId]);
    }

    // Seed sub-categories for Bills & Utilities
    const billsCategoryId = getCategoryId('Bills & Utilities');
    if (billsCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Electricity', $1),
          ('Water', $1),
          ('Internet', $1),
          ('Phone', $1),
          ('Rent', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [billsCategoryId]);
    }

    // Seed sub-categories for Healthcare
    const healthcareCategoryId = getCategoryId('Healthcare');
    if (healthcareCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Doctor Visits', $1),
          ('Pharmacy', $1),
          ('Insurance', $1),
          ('Dental', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [healthcareCategoryId]);
    }

    // Seed sub-categories for Income categories
    const salaryCategoryId = getCategoryId('Salary');
    if (salaryCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Monthly Salary', $1),
          ('Bonus', $1),
          ('Overtime', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [salaryCategoryId]);
    }

    const investmentsCategoryId = getCategoryId('Investments');
    if (investmentsCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Dividends', $1),
          ('Interest', $1),
          ('Capital Gains', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [investmentsCategoryId]);
    }

    // Seed sub-categories for Transfer categories
    const accountTransferCategoryId = getCategoryId('Account Transfer');
    if (accountTransferCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Checking to Savings', $1),
          ('Savings to Checking', $1),
          ('Between Accounts', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [accountTransferCategoryId]);
    }

    const savingsTransferCategoryId = getCategoryId('Savings Transfer');
    if (savingsTransferCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Emergency Fund', $1),
          ('Goal Savings', $1),
          ('General Savings', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [savingsTransferCategoryId]);
    }

    const investmentTransferCategoryId = getCategoryId('Investment Transfer');
    if (investmentTransferCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Retirement Account', $1),
          ('Brokerage Account', $1),
          ('Mutual Funds', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [investmentTransferCategoryId]);
    }

    const loanPaymentCategoryId = getCategoryId('Loan Payment');
    if (loanPaymentCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Mortgage Payment', $1),
          ('Car Loan', $1),
          ('Personal Loan', $1),
          ('Student Loan', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [loanPaymentCategoryId]);
    }

    const creditCardPaymentCategoryId = getCategoryId('Credit Card Payment');
    if (creditCardPaymentCategoryId) {
      await pool.query(`
        INSERT INTO sub_categories (name, category_id) VALUES
          ('Full Payment', $1),
          ('Minimum Payment', $1),
          ('Partial Payment', $1)
        ON CONFLICT (name, category_id) DO NOTHING;
      `, [creditCardPaymentCategoryId]);
    }

    console.log('✅ Sub-categories seeded\n');

    // Seed payment modes
    console.log('▶️  Seeding payment modes...');
    await pool.query(`
      INSERT INTO payment_modes (name) VALUES
        ('Cash'),
        ('Credit Card'),
        ('Debit Card'),
        ('UPI'),
        ('Bank Transfer'),
        ('Digital Wallet'),
        ('Check')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Payment modes seeded\n');

    // Seed sample accounts
    console.log('▶️  Seeding sample accounts...');
    await pool.query(`
      INSERT INTO accounts (name) VALUES
        ('Primary Checking'),
        ('Savings Account'),
        ('Credit Card - Main'),
        ('Cash Wallet'),
        ('Investment Account')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Sample accounts seeded\n');

    console.log('All seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
