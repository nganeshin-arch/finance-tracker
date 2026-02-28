/**
 * Script to verify database indexes are being used
 * Runs EXPLAIN ANALYZE on key queries to check performance
 * Requirements: 10.1, 10.2
 */

import pool from '../config/database';

interface QueryAnalysis {
  queryName: string;
  query: string;
  params: any[];
  usesIndex: boolean;
  executionTime: number;
  planDetails: string[];
}

/**
 * Run EXPLAIN ANALYZE on a query and extract performance metrics
 */
async function analyzeQuery(
  queryName: string,
  query: string,
  params: any[]
): Promise<QueryAnalysis> {
  const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
  
  try {
    const result = await pool.query(explainQuery, params);
    const plan = result.rows[0]['QUERY PLAN'][0];
    
    // Extract execution time
    const executionTime = plan['Execution Time'] || 0;
    
    // Check if indexes are being used
    const planText = JSON.stringify(plan);
    const usesIndex = 
      planText.includes('Index Scan') || 
      planText.includes('Index Only Scan') ||
      planText.includes('Bitmap Index Scan');
    
    // Extract plan details
    const planDetails: string[] = [];
    extractPlanDetails(plan.Plan, planDetails, 0);
    
    return {
      queryName,
      query: query.substring(0, 100) + '...',
      params,
      usesIndex,
      executionTime,
      planDetails
    };
  } catch (error: any) {
    console.error(`Error analyzing query ${queryName}:`, error.message);
    throw error;
  }
}

/**
 * Recursively extract plan details from EXPLAIN output
 */
function extractPlanDetails(plan: any, details: string[], depth: number): void {
  const indent = '  '.repeat(depth);
  
  if (plan['Node Type']) {
    let detail = `${indent}${plan['Node Type']}`;
    
    if (plan['Index Name']) {
      detail += ` using ${plan['Index Name']}`;
    }
    
    if (plan['Relation Name']) {
      detail += ` on ${plan['Relation Name']}`;
    }
    
    if (plan['Actual Total Time']) {
      detail += ` (time: ${plan['Actual Total Time'].toFixed(2)}ms)`;
    }
    
    details.push(detail);
  }
  
  if (plan.Plans) {
    plan.Plans.forEach((subPlan: any) => {
      extractPlanDetails(subPlan, details, depth + 1);
    });
  }
}

/**
 * Check if required indexes exist
 */
async function checkIndexes(): Promise<void> {
  console.log('\n=== Checking Database Indexes ===\n');
  
  const indexQuery = `
    SELECT 
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('transactions', 'users', 'categories', 'transaction_types')
    ORDER BY tablename, indexname
  `;
  
  const result = await pool.query(indexQuery);
  
  console.log('Existing Indexes:');
  result.rows.forEach((row: any) => {
    console.log(`  ${row.tablename}.${row.indexname}`);
    console.log(`    ${row.indexdef}`);
  });
  
  // Check for required indexes
  const requiredIndexes = [
    { table: 'transactions', column: 'user_id', name: 'idx_transactions_user_id' },
    { table: 'transactions', columns: ['user_id', 'date'], name: 'idx_transactions_user_date' }
  ];
  
  console.log('\n=== Required Index Check ===\n');
  
  for (const required of requiredIndexes) {
    const found = result.rows.some((row: any) => 
      row.tablename === required.table && row.indexname === required.name
    );
    
    if (found) {
      console.log(`✓ ${required.name} exists`);
    } else {
      console.log(`✗ ${required.name} MISSING`);
      console.log(`  Recommendation: CREATE INDEX ${required.name} ON ${required.table}(${Array.isArray(required.columns) ? required.columns.join(', ') : required.column});`);
    }
  }
}

/**
 * Analyze key transaction queries
 */
async function analyzeTransactionQueries(): Promise<QueryAnalysis[]> {
  console.log('\n=== Analyzing Transaction Queries ===\n');
  
  const analyses: QueryAnalysis[] = [];
  
  // Test user ID (use first user in database)
  const userResult = await pool.query('SELECT id FROM users LIMIT 1');
  if (userResult.rows.length === 0) {
    console.log('No users found in database. Skipping query analysis.');
    return analyses;
  }
  const testUserId = userResult.rows[0].id;
  
  // Query 1: Find transactions by user_id
  const query1 = `
    SELECT t.id, t.user_id, t.date, t.amount
    FROM transactions t
    WHERE t.user_id = $1
    ORDER BY t.date DESC
    LIMIT 10
  `;
  analyses.push(await analyzeQuery('findByUserId', query1, [testUserId]));
  
  // Query 2: Find transactions by user_id with date range
  const query2 = `
    SELECT t.id, t.user_id, t.date, t.amount
    FROM transactions t
    WHERE t.user_id = $1 
      AND t.date >= $2 
      AND t.date <= $3
    ORDER BY t.date DESC
  `;
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');
  analyses.push(await analyzeQuery('findByUserIdWithDateRange', query2, [testUserId, startDate, endDate]));
  
  // Query 3: Dashboard summary query
  const query3 = `
    SELECT 
      SUM(CASE WHEN tt.name = 'Income' THEN t.amount ELSE 0 END) as total_income,
      SUM(CASE WHEN tt.name = 'Expense' THEN t.amount ELSE 0 END) as total_expense,
      COUNT(*) as transaction_count
    FROM transactions t
    INNER JOIN transaction_types tt ON t.transaction_type_id = tt.id
    WHERE t.user_id = $1
  `;
  analyses.push(await analyzeQuery('dashboardSummary', query3, [testUserId]));
  
  // Query 4: Category breakdown query
  const query4 = `
    SELECT 
      c.id as category_id,
      c.name as category_name,
      COALESCE(SUM(t.amount), 0) as amount
    FROM transactions t
    INNER JOIN transaction_types tt ON t.transaction_type_id = tt.id
    INNER JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = $1 AND tt.name = $2
    GROUP BY c.id, c.name
    ORDER BY amount DESC
  `;
  analyses.push(await analyzeQuery('categoryBreakdown', query4, [testUserId, 'Expense']));
  
  return analyses;
}

/**
 * Print analysis results
 */
function printAnalysisResults(analyses: QueryAnalysis[]): void {
  console.log('\n=== Query Performance Analysis ===\n');
  
  analyses.forEach((analysis) => {
    console.log(`Query: ${analysis.queryName}`);
    console.log(`  Uses Index: ${analysis.usesIndex ? '✓ YES' : '✗ NO'}`);
    console.log(`  Execution Time: ${analysis.executionTime.toFixed(2)}ms`);
    console.log(`  Plan:`);
    analysis.planDetails.forEach((detail) => {
      console.log(`    ${detail}`);
    });
    console.log('');
  });
  
  // Summary
  const allUseIndexes = analyses.every(a => a.usesIndex);
  const avgExecutionTime = analyses.reduce((sum, a) => sum + a.executionTime, 0) / analyses.length;
  
  console.log('=== Summary ===');
  console.log(`  All queries use indexes: ${allUseIndexes ? '✓ YES' : '✗ NO'}`);
  console.log(`  Average execution time: ${avgExecutionTime.toFixed(2)}ms`);
  
  if (!allUseIndexes) {
    console.log('\n⚠️  Warning: Some queries are not using indexes. Consider adding indexes to improve performance.');
  }
  
  if (avgExecutionTime > 100) {
    console.log('\n⚠️  Warning: Average execution time is high. Consider optimizing queries or adding indexes.');
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    console.log('Starting database index verification...\n');
    
    // Check indexes
    await checkIndexes();
    
    // Analyze queries
    const analyses = await analyzeTransactionQueries();
    
    // Print results
    if (analyses.length > 0) {
      printAnalysisResults(analyses);
    }
    
    console.log('\n✓ Index verification complete\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error during index verification:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { analyzeQuery, checkIndexes, analyzeTransactionQueries };
