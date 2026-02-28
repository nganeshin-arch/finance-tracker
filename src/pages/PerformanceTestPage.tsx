import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TransactionTable } from '../components/TransactionTable';
import { generateMockTransactions, measurePerformance } from '../utils/performanceTestUtils';
import { Transaction } from '../types/models';

export const PerformanceTestPage: React.FC = () => {
  const [datasetSize, setDatasetSize] = useState<number>(1000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const handleGenerateData = () => {
    const results: string[] = [];
    results.push(`Generating ${datasetSize} mock transactions...`);
    
    const { result, duration } = measurePerformance(
      () => generateMockTransactions(datasetSize),
      'Data Generation'
    );
    
    results.push(`✓ Generated ${result.length} transactions in ${duration.toFixed(2)}ms`);
    setTransactions(result);
    setTestResults(results);
  };

  const handleRunTests = () => {
    if (transactions.length === 0) {
      setTestResults(['⚠️ Please generate data first']);
      return;
    }

    const results: string[] = [];
    results.push(`\n=== Testing with ${transactions.length} transactions ===\n`);

    // Test date filtering
    const dateFilterResult = measurePerformance(
      () => transactions.filter(t => {
        const date = t.date instanceof Date ? t.date : new Date(t.date);
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return date >= thirtyDaysAgo && date <= now;
      }),
      'Date Filtering'
    );
    results.push(`Date Filtering: ${dateFilterResult.duration.toFixed(2)}ms (${dateFilterResult.result.length} results)`);

    // Test search filtering
    const searchFilterResult = measurePerformance(
      () => transactions.filter(t => 
        t.description?.toLowerCase().includes('shop') ||
        t.category?.name.toLowerCase().includes('shop')
      ),
      'Search Filtering'
    );
    results.push(`Search Filtering: ${searchFilterResult.duration.toFixed(2)}ms (${searchFilterResult.result.length} results)`);

    // Test type filtering
    const typeFilterResult = measurePerformance(
      () => transactions.filter(t => t.transactionType?.name === 'Expense'),
      'Type Filtering'
    );
    results.push(`Type Filtering: ${typeFilterResult.duration.toFixed(2)}ms (${typeFilterResult.result.length} results)`);

    // Test combined filtering (realistic scenario)
    const combinedFilterResult = measurePerformance(
      () => transactions.filter(t => {
        const date = t.date instanceof Date ? t.date : new Date(t.date);
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const inDateRange = date >= thirtyDaysAgo && date <= now;
        const matchesSearch = t.description?.toLowerCase().includes('shop');
        const matchesType = t.transactionType?.name === 'Expense';
        return inDateRange && matchesSearch && matchesType;
      }),
      'Combined Filtering'
    );
    results.push(`Combined Filtering: ${combinedFilterResult.duration.toFixed(2)}ms (${combinedFilterResult.result.length} results)`);

    results.push('\n✅ Performance tests completed');
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <h1 className="text-xl font-bold">Performance Testing</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Dataset Size:</label>
              <select
                value={datasetSize}
                onChange={(e) => setDatasetSize(Number(e.target.value))}
                className="px-3 py-2 border rounded-md"
              >
                <option value={100}>100 transactions</option>
                <option value={500}>500 transactions</option>
                <option value={1000}>1,000 transactions</option>
                <option value={5000}>5,000 transactions</option>
                <option value={10000}>10,000 transactions</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerateData}>
                Generate Test Data
              </Button>
              <Button onClick={handleRunTests} variant="outline" disabled={transactions.length === 0}>
                Run Performance Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {testResults.join('\n')}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Live Transaction Table Test */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Live Component Test ({transactions.length} transactions)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test the search and filter functionality with the generated dataset. 
                The search is debounced by 300ms for better performance.
              </p>
              <TransactionTable
                transactions={transactions}
                onDelete={(id) => {
                  setTransactions(prev => prev.filter(t => t.id !== id));
                }}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};
