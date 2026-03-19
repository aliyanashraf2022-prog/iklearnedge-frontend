import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsAPI } from '@/services/api';

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
  currency_symbol: 'د.إ',
  site_name: 'IkLearnEdge',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const baseUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
      const sameOrigin = !!baseUrl && typeof window !== 'undefined' && baseUrl.startsWith(window.location.origin);

      if (!sameOrigin) {
        setLoading(false);
        return;
      }

      const response = await settingsAPI.getAll();
      if (response.data) {
        setSettings({
          primary_color: response.data.primary_color || defaultSettings.primary_color,
          secondary_color: response.data.secondary_color || defaultSettings.secondary_color,
          accent_color: response.data.accent_color || defaultSettings.accent_color,
          currency: response.data.currency || defaultSettings.currency,
          currency_symbol: response.data.currency_symbol || defaultSettings.currency_symbol,
          site_name: response.data.site_name || defaultSettings.site_name,
        });
        
        // Apply theme colors to CSS variables
        document.documentElement.style.setProperty('--primary-color', response.data.primary_color || defaultSettings.primary_color);
        document.documentElement.style.setProperty('--secondary-color', response.data.secondary_color || defaultSettings.secondary_color);
        document.documentElement.style.setProperty('--accent-color', response.data.accent_color || defaultSettings.accent_color);
      }
    } catch (error) {
      // Silent fallback to defaults in preview/offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getCurrencySymbol = () => {
    return settings.currency_symbol || 'د.إ';
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol();
    return `${symbol} ${amount.toFixed(2)}`;
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      loading, 
      refreshSettings: fetchSettings,
      getCurrencySymbol,
      formatCurrency 
    }}>
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
