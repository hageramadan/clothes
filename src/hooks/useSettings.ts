// hooks/useSettings.ts
import { useEffect, useState } from 'react';
import { getSettings } from '@/services/settingsApi';

interface SettingData {
  name: string;
  address: string;
  privacy_policy: string;
  terms_and_conditions: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  snapchat: string;
  instagram: string;
  whatsapp: string;
  email: string;
  phone: string;
  logo?: string;
  main_color?: string;
  secondary_color?: string;
  template_id?: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSettings();
        setSettings(data.setting);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}