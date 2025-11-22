'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Dropdown from '@/components/Dropdown';

export default function Dashboard() {
  const router = useRouter();
  const [formLoading, setFormLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const expiryOptions = [
    { label: 'Never', value: '0' },
    { label: '15 days', value: '15' },
    { label: '30 days', value: '30' },
    { label: '45 days', value: '45' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    try {
      const payload: any = { url, expiryDays: parseInt(expiryDays) };
      if (customCode.trim()) payload.code = customCode.trim();

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create link');
        return;
      }

      setSuccess(`✓ Link created! Code: ${data.code}`);
      setUrl('');
      setCustomCode('');
      setTimeout(() => router.push('/links'), 1500);
    } catch (err) {
      setError('An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Shorten Your Links</h2>
          <p className="text-lg text-gray-600">Create short, memorable links in seconds</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long URL <span className="text-orange-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Code <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="mycode"
                  pattern="[A-Za-z0-9]{6,8}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-1.5">6-8 alphanumeric characters</p>
              </div>

              <Dropdown label="Expires In" options={expiryOptions} value={expiryDays} onChange={setExpiryDays} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 focus:ring-4 focus:ring-orange-300 disabled:opacity-50 transition shadow-md cursor-pointer"
            >
              {formLoading ? 'Creating...' : 'Create Short Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
