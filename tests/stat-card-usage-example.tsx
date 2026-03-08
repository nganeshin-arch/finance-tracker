/**
 * StatCard Component Usage Examples
 * Task 7.1: Enhanced StatCard for financial metrics
 * 
 * This file demonstrates various usage patterns for the StatCard component
 */

import React from 'react';
import { StatCard } from '@/components/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  CreditCard,
  PiggyBank,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatUtils';

// Example 1: Basic StatCard with no trend
export const BasicStatCard = () => (
  <StatCard
    label="Total Balance"
    value={45231.89}
    formatValue={(val) => formatCurrency(Number(val))}
    icon={Wallet}
  />
);

// Example 2: StatCard with positive trend
export const PositiveTrendStatCard = () => (
  <StatCard
    label="Monthly Income"
    value={12450.00}
    trend="positive"
    trendValue="+12.5%"
    icon={TrendingUp}
    formatValue={(val) => formatCurrency(Number(val))}
  />
);

// Example 3: StatCard with negative trend
export const NegativeTrendStatCard = () => (
  <StatCard
    label="Monthly Expenses"
    value={8234.50}
    trend="negative"
    trendValue="-8.3%"
    icon={TrendingDown}
    formatValue={(val) => formatCurrency(Number(val))}
  />
);

// Example 4: StatCard with neutral trend
export const NeutralTrendStatCard = () => (
  <StatCard
    label="Transfers"
    value={1200.00}
    trend="neutral"
    trendValue="0.0%"
    icon={DollarSign}
    formatValue={(val) => formatCurrency(Number(val))}
  />
);

// Example 5: StatCard with gradient background
export const GradientStatCard = () => (
  <StatCard
    label="Net Worth"
    value={125450.89}
    useGradient={true}
    gradientClass="bg-gradient-premium"
    icon={Sparkles}
    formatValue={(val) => formatCurrency(Number(val))}
  />
);

// Example 6: StatCard with custom gradient (income)
export const IncomeGradientStatCard = () => (
  <StatCard
    label="Total Income"
    value={24680.00}
    useGradient={true}
    gradientClass="bg-gradient-income"
    icon={TrendingUp}
    formatValue={(val) => formatCurrency(Number(val))}
  />
);

// Example 7: StatCard with custom gradient (expense)
export const ExpenseGradientStatCard = () => (
  <StatCard
    label="Total Expenses"
    value={18945.32}
    useGradient={true}
    gradientClass="bg-gradient-expense"
    icon={TrendingDown}
    formatValue={(val) => formatCurrency(Number(val))}
  />
);

// Example 8: StatCard without trend icon
export const NoTrendIconStatCard = () => (
  <StatCard
    label="Savings"
    value={5678.90}
    trend="positive"
    showTrendIcon={false}
    icon={PiggyBank}
    formatValue={(val) => formatCurrency(Number(val))}
  />
);

// Example 9: StatCard with premium variant
export const PremiumStatCard = () => (
  <StatCard
    label="Credit Available"
    value={15000.00}
    variant="premium"
    icon={CreditCard}
    formatValue={(val) => formatCurrency(Number(val))}
  />
);

// Example 10: Complete Dashboard Grid
export const DashboardStatsGrid = () => {
  const stats = {
    income: 12450.00,
    expense: 8234.50,
    transfers: 1200.00,
    balance: 4215.50,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Income"
        value={stats.income}
        trend="positive"
        trendValue="+12.5%"
        icon={TrendingUp}
        formatValue={(val) => formatCurrency(Number(val))}
      />
      
      <StatCard
        label="Expenses"
        value={stats.expense}
        trend="negative"
        trendValue="-8.3%"
        icon={TrendingDown}
        formatValue={(val) => formatCurrency(Number(val))}
      />
      
      <StatCard
        label="Transfers"
        value={stats.transfers}
        trend="neutral"
        trendValue="0.0%"
        icon={DollarSign}
        formatValue={(val) => formatCurrency(Number(val))}
      />
      
      <StatCard
        label="Balance"
        value={stats.balance}
        trend={stats.balance >= 0 ? "positive" : "negative"}
        icon={Wallet}
        formatValue={(val) => formatCurrency(Number(val))}
      />
    </div>
  );
};

// Example 11: Dynamic trend based on value
export const DynamicTrendStatCard = ({ value }: { value: number }) => {
  const previousValue = 10000;
  const change = value - previousValue;
  const changePercent = ((change / previousValue) * 100).toFixed(1);
  
  const trend = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
  const trendValue = `${change > 0 ? '+' : ''}${changePercent}%`;

  return (
    <StatCard
      label="Account Balance"
      value={value}
      trend={trend}
      trendValue={trendValue}
      icon={Wallet}
      formatValue={(val) => formatCurrency(Number(val))}
    />
  );
};

// Example 12: StatCard with custom formatting
export const CustomFormattedStatCard = () => {
  const formatAsPercentage = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  };

  return (
    <StatCard
      label="Interest Rate"
      value={3.75}
      formatValue={formatAsPercentage}
      icon={TrendingUp}
    />
  );
};

// Example 13: StatCard with large numbers
export const LargeNumberStatCard = () => {
  const formatLargeNumber = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return formatCurrency(num);
  };

  return (
    <StatCard
      label="Portfolio Value"
      value={1250000}
      formatValue={formatLargeNumber}
      useGradient={true}
      gradientClass="bg-gradient-premium"
      icon={Sparkles}
    />
  );
};

// Example 14: Responsive grid with mixed variants
export const MixedVariantsGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    {/* Standard with trend */}
    <StatCard
      label="Monthly Income"
      value={12450.00}
      trend="positive"
      trendValue="+12.5%"
      icon={TrendingUp}
      formatValue={(val) => formatCurrency(Number(val))}
    />
    
    {/* Gradient highlight */}
    <StatCard
      label="Total Savings"
      value={45231.89}
      useGradient={true}
      gradientClass="bg-gradient-income"
      icon={PiggyBank}
      formatValue={(val) => formatCurrency(Number(val))}
    />
    
    {/* Premium variant */}
    <StatCard
      label="Investments"
      value={78900.50}
      variant="premium"
      icon={Sparkles}
      formatValue={(val) => formatCurrency(Number(val))}
    />
    
    {/* Standard with negative trend */}
    <StatCard
      label="Monthly Expenses"
      value={8234.50}
      trend="negative"
      trendValue="-8.3%"
      icon={TrendingDown}
      formatValue={(val) => formatCurrency(Number(val))}
    />
  </div>
);

// Example 15: StatCard with conditional rendering
export const ConditionalStatCard = ({ 
  balance, 
  showTrend = true 
}: { 
  balance: number; 
  showTrend?: boolean;
}) => {
  const isPositive = balance >= 0;
  
  return (
    <StatCard
      label="Current Balance"
      value={balance}
      trend={showTrend ? (isPositive ? "positive" : "negative") : "none"}
      showTrendIcon={showTrend}
      icon={Wallet}
      formatValue={(val) => formatCurrency(Number(val))}
      className={isPositive ? "border-income-200" : "border-expense-200"}
    />
  );
};

// Example 16: Animated value changes (for real-time updates)
export const AnimatedStatCard = () => {
  const [value, setValue] = React.useState(10000);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => prev + Math.random() * 100 - 50);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <StatCard
      label="Live Balance"
      value={value}
      trend="positive"
      icon={Wallet}
      formatValue={(val) => formatCurrency(Number(val))}
      className="transition-all duration-250"
    />
  );
};

// Export all examples
export const StatCardExamples = {
  BasicStatCard,
  PositiveTrendStatCard,
  NegativeTrendStatCard,
  NeutralTrendStatCard,
  GradientStatCard,
  IncomeGradientStatCard,
  ExpenseGradientStatCard,
  NoTrendIconStatCard,
  PremiumStatCard,
  DashboardStatsGrid,
  DynamicTrendStatCard,
  CustomFormattedStatCard,
  LargeNumberStatCard,
  MixedVariantsGrid,
  ConditionalStatCard,
  AnimatedStatCard,
};
