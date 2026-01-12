'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';

interface UserSettings {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: 'small' | 'medium' | 'large';
  defaultMode: 'read' | 'scan' | 'reference';
  emailDigest: 'daily' | 'weekly' | 'none';
}

interface Profile {
  id: string;
  email: string;
  plan: 'free' | 'premium';
  settings: UserSettings;
}

export default function SettingsPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    fontSize: 'medium',
    defaultMode: 'read',
    emailDigest: 'none',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setSettings(profileData.settings || settings);
      }
    }

    loadUser();
  }, [router, supabase]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ settings })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage('Settings saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-serif mb-8">Settings</h1>

        <div className="space-y-8">
          {/* Account */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {profile?.plan || 'Free'} plan
                  </p>
                </div>
                {profile?.plan === 'free' && (
                  <button className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Reading Preferences */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Reading Preferences</h2>
            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="flex gap-2">
                  {(['light', 'dark', 'sepia'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateSetting('theme', theme)}
                      className={`px-4 py-2 rounded-lg border capitalize ${settings.theme === theme
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`px-4 py-2 rounded-lg border capitalize ${settings.fontSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Reading Mode
                </label>
                <div className="flex gap-2">
                  {(['read', 'scan', 'reference'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSetting('defaultMode', mode)}
                      className={`px-4 py-2 rounded-lg border capitalize ${settings.defaultMode === mode
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Email Digest */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Email Digest</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receive a digest of your unread articles
              </label>
              <div className="flex gap-2">
                {(['none', 'daily', 'weekly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => updateSetting('emailDigest', freq)}
                    className={`px-4 py-2 rounded-lg border capitalize ${settings.emailDigest === freq
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {freq === 'none' ? 'Off' : freq}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {message && (
              <span
                className={`text-sm ${message.includes('Failed') ? 'text-red-500' : 'text-green-600'
                  }`}
              >
                {message}
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
