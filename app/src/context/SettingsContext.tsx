import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsAPI } from '@/services/api';
import type { ReactNode } from 'react';

interface Settings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  currency: string;
  currency_symbol: string;
  site_name: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  getCurrencySymbol: () => string;
  formatCurrency: (amount: number) => string;
}

const defaultSettings: Settings = {
  primary_color: '#f5a623',
  secondary_color: '#4a4a4a',
  accent_color: '#3498db',
  currency: 'AED',
  currency_symbol: 'AED',
  site_name: 'IkLearnEdge',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      if (response) {
        setSettings({
          primary_color: response.primary_color || defaultSettings.primary_color,
          secondary_color: response.secondary_color || defaultSettings.secondary_color,
          accent_color: response.accent_color || defaultSettings.accent_color,
          currency: response.currency || defaultSettings.currency,
          currency_symbol: response.currency_symbol || defaultSettings.currency_symbol,
          site_name: response.site_name || defaultSettings.site_name,
        });

        document.documentElement.style.setProperty('--primary-color', response.primary_color || defaultSettings.primary_color);
        document.documentElement.style.setProperty('--secondary-color', response.secondary_color || defaultSettings.secondary_color);
        document.documentElement.style.setProperty('--accent-color', response.accent_color || defaultSettings.accent_color);
      }
    } catch {
      // Silent fallback to defaults in preview/offline.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getCurrencySymbol = () => settings.currency_symbol || 'AED';

  const formatCurrency = (amount: number | string | undefined | null) => {
    const symbol = getCurrencySymbol();
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount as string) || 0;
    return `${symbol} ${numAmount.toFixed(2)}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        getCurrencySymbol,
        formatCurrency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
