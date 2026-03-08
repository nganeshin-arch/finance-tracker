import React, { useState } from 'react';
import { Settings, Calendar, Globe, DollarSign, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useToast } from '../hooks/useToast';

interface UserSettingsProps {
  onClose?: () => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ onClose }) => {
  const { preferences, loading, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [monthlyStartDate, setMonthlyStartDate] = useState<number>(preferences?.monthlyStartDate || 1);
  const [timezone, setTimezone] = useState<string>(preferences?.timezone || 'Asia/Kolkata');
  const [currency, setCurrency] = useState<string>(preferences?.currency || 'INR');
  const [dateFormat, setDateFormat] = useState<string>(preferences?.dateFormat || 'DD/MM/YYYY');

  // Update form state when preferences load
  React.useEffect(() => {
    if (preferences) {
      setMonthlyStartDate(preferences.monthlyStartDate);
      setTimezone(preferences.timezone);
      setCurrency(preferences.currency);
      setDateFormat(preferences.dateFormat);
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      
      await updatePreferences({
        monthlyStartDate,
        timezone,
        currency,
        dateFormat
      });

      setSaved(true);
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully',
      });

      // Close the modal after successful save
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 800); // Shorter delay for better UX
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          User Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Start Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Monthly Cycle Start Date
          </label>
          <Input
            type="number"
            min="1"
            max="31"
            value={monthlyStartDate}
            onChange={(e) => setMonthlyStartDate(parseInt(e.target.value) || 1)}
            placeholder="Day of month (1-31)"
          />
          <p className="text-xs text-muted-foreground">
            Set the day of the month when your monthly cycle starts (e.g., 24 for 24th to 23rd cycle)
          </p>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" />
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Date Format
          </label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className={`w-full transition-colors ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : saved ? 'Saved! Closing...' : 'Save Settings'}
        </Button>
        
        {saving && (
          <p className="text-xs text-muted-foreground text-center">
            Settings will be saved and modal will close automatically
          </p>
        )}
        
        {saved && (
          <p className="text-xs text-green-600 text-center font-medium">
            ✓ Settings saved successfully! Modal closing...
          </p>
        )}
      </CardContent>
    </Card>
  );
};