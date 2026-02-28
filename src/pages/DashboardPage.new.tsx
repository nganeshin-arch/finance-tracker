import React from 'react';
import DashboardSummary from '../components-new/DashboardSummary.new';
import ExpenseByCategoryChart from '../components/ExpenseByCategoryChart.new';
import MonthlyTrendChart from '../components/MonthlyTrendChart.new';

/**
 * DashboardPage - Main dashboard view with financial summary and charts
 * 
 * Layout Structure:
 * - Responsive container with max-width constraint
 * - Proper spacing and padding for all screen sizes
 * - Grid layout for charts (1 column mobile, 2 columns desktop)
 * 
 * Accessibility:
 * - Semantic HTML with proper heading hierarchy
 * - ARIA labels for screen readers
 * - Keyboard navigable sections
 */
const DashboardPage: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page Header */}
      <h1 
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8"
        aria-label="Dashboard page"
      >
        Dashboard
      </h1>

      {/* Dashboard Summary Section */}
      <section 
        className="mb-6 sm:mb-8" 
        role="region" 
        aria-label="Financial summary"
      >
        <DashboardSummary />
      </section>

      {/* Charts Section - Responsive Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Expense by Category Chart */}
        <div role="region" aria-label="Expense by category chart">
          <ExpenseByCategoryChart />
        </div>

        {/* Monthly Trend Chart */}
        <div role="region" aria-label="Monthly trend chart">
          <MonthlyTrendChart />
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
