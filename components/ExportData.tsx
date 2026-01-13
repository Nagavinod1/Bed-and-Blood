'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileJson, FileText, Table } from 'lucide-react';

export default function ExportData() {
  const [loading, setLoading] = useState<'json' | 'pdf' | 'csv' | null>(null);

  const handleExport = async (format: 'json' | 'pdf' | 'csv') => {
    setLoading(format);
    try {
      let endpoint = '';
      if (format === 'json') {
        endpoint = '/api/export/hospitals-doctors';
      } else {
        endpoint = `/api/export/${format}`;
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'json') {
        const data = await response.json();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        downloadFile(blob, 'hospitals-doctors-report.json');
      } else {
        const blob = await response.blob();
        const extension = format === 'pdf' ? 'pdf' : 'csv';
        downloadFile(blob, `hospitals-doctors-report.${extension}`);
      }

      toast.success(`${format.toUpperCase()} exported successfully!`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800">Export Hospitals & Doctors Data</h2>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleExport('json')}
          disabled={loading !== null}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition"
        >
          <FileJson size={18} />
          {loading === 'json' ? 'Exporting...' : 'Export JSON'}
          {loading === 'json' && <span className="animate-spin">⌛</span>}
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={loading !== null}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition"
        >
          <FileText size={18} />
          {loading === 'pdf' ? 'Exporting...' : 'Export PDF'}
          {loading === 'pdf' && <span className="animate-spin">⌛</span>}
        </button>

        <button
          onClick={() => handleExport('csv')}
          disabled={loading !== null}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition"
        >
          <Table size={18} />
          {loading === 'csv' ? 'Exporting...' : 'Export CSV'}
          {loading === 'csv' && <span className="animate-spin">⌛</span>}
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={loading !== null}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition"
        >
          <Download size={18} />
          {loading === 'pdf' ? 'Generating...' : 'Download Report'}
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Export hospitals, doctors, admins, and contact information in your preferred format.
      </p>
    </div>
  );
}
