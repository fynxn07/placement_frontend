import { useState } from 'react';
import {
  previewStudentImport,
  confirmStudentImport,
} from '../../services/studentService';

import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export default function StudentImportModal({ onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Select Excel file
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];

    setFile(selectedFile || null);
    setPreview(null);
    setError('');
    setSuccess('');
  };

  // Preview Excel file
  const handlePreview = async () => {
    if (!file) {
      setError('Please select an Excel file.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await previewStudentImport(file);
      setPreview(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to preview Excel file.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirm import
  const handleImport = async () => {
    if (!file || !preview?.valid_count) return;

    const confirmed = window.confirm(
      `Import ${preview.valid_count} valid students?`
    );

    if (!confirmed) return;

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const result = await confirmStudentImport(file);

      setSuccess(
        result.message ||
        `Successfully imported ${result.imported_count} students.`
      );

      onImported?.(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Student import failed.'
      );
    } finally {
      setImporting(false);
    }
  };

  // Format validation errors
  const formatErrors = errors => {
    if (!errors) return '-';

    if (Array.isArray(errors)) {
      return errors.join(', ');
    }

    return Object.entries(errors)
      .map(([field, messages]) => {
        const text = Array.isArray(messages)
          ? messages.join(', ')
          : String(messages);

        return `${field}: ${text}`;
      })
      .join('; ');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Import Students
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Upload your Excel file and preview the records.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading || importing}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">

          {/* File Upload */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">

            <FileSpreadsheet className="w-10 h-10 mx-auto text-green-600 mb-3" />

            <label className="cursor-pointer">

              <span className="text-sm font-semibold text-blue-600 hover:underline">
                Choose Excel file
              </span>

              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />

            </label>

            <p className="text-xs text-slate-500 mt-2">
              Supported format: .xlsx
            </p>

            {file && (
              <p className="text-sm text-slate-700 mt-3 font-medium">
                {file.name}
              </p>
            )}

          </div>

          {/* Preview Button */}
          <div className="flex justify-end mt-4">

            <button
              onClick={handlePreview}
              disabled={!file || loading || importing}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />

              {loading ? 'Checking...' : 'Preview Excel'}
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Preview Results */}
          {preview && (
            <div className="mt-6">

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Total Students</p>
                  <h3 className="text-2xl font-bold">
                    {preview.total_students}
                  </h3>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Valid Students</p>
                  <h3 className="text-2xl font-bold text-green-700">
                    {preview.valid_count}
                  </h3>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">Invalid Students</p>
                  <h3 className="text-2xl font-bold text-red-700">
                    {preview.invalid_count}
                  </h3>
                </div>

              </div>

              {/* Valid Students */}
              <div className="mb-6">

                <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Valid Students ({preview.valid_count})
                </h3>

                {preview.valid_students?.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg max-h-64">

                    <table className="min-w-full text-sm text-left">

                      <thead className="bg-green-50 sticky top-0">
                        <tr>
                          <th className="p-3">Row</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Batch</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">

                        {preview.valid_students.map((student, index) => (
                          <tr key={index}>
                            <td className="p-3">{student.row}</td>
                            <td className="p-3">{student.name}</td>
                            <td className="p-3">{student.email || '-'}</td>
                            <td className="p-3">{student.phone}</td>
                            <td className="p-3">{student.batch}</td>
                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No valid students found.
                  </p>
                )}

              </div>

              {/* Invalid Students */}
              <div>

                <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Invalid Students ({preview.invalid_count})
                </h3>

                {preview.invalid_students?.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg max-h-64">

                    <table className="min-w-full text-sm text-left">

                      <thead className="bg-red-50 sticky top-0">
                        <tr>
                          <th className="p-3">Row</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Errors</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">

                        {preview.invalid_students.map((student, index) => (
                          <tr key={index}>
                            <td className="p-3">{student.row}</td>
                            <td className="p-3">{student.name || '-'}</td>
                            <td className="p-3 text-red-600">
                              {formatErrors(student.errors)}
                            </td>
                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No invalid students found.
                  </p>
                )}

              </div>

              {/* Confirm Import */}
              <div className="flex justify-end mt-6">

                <button
                  onClick={handleImport}
                  disabled={
                    !preview.valid_count ||
                    importing ||
                    loading ||
                    Boolean(success)
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Confirm Import'}
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}