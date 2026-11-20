import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { listStudents, listBatchSwitches } from '../services/studentService';

const categoryTitles = {
  'total-enrolled': 'Total Enrolled Students',
  eligible: 'Placement Eligible Students',
  'not-eligible': 'Not Eligible Students',
  dropped: 'Discontinued Students',
  'batch-switch': 'Batch Transfer Students',
  rejoined: 'Rejoined Students',
  placed: 'Successfully Placed Students',
};

function isDropped(student) {
  return ['Drop', 'BatchSwitch/dropped'].includes(student.courseStatus);
}

export default function DashboardStudents() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [batchSwitches, setBatchSwitches] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError('');

      try {
        if (category === 'batch-switch') {
          const data = await listBatchSwitches();
          setBatchSwitches(data);
        } else {
          const data = await listStudents();
          setStudents(data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to load student details. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [category]);

  const filteredStudents = useMemo(() => {
    switch (category) {
      case 'eligible':
        return students.filter(student => student.eligible === true);

      case 'not-eligible':
        return students.filter(
          student => student.eligible === false && !isDropped(student)
        );

      case 'dropped':
        return students.filter(isDropped);

      case 'rejoined':
        return students.filter(
          student => student.courseStatus === 'Rejoined'
        );

      case 'placed':
        return students.filter(
          student => student.placementStatus === 'Placed'
        );

      case 'total-enrolled':
        return students.filter(student => !isDropped(student));

      default:
        return [];
    }
  }, [students, category]);

  const displayedStudents =
    category === 'batch-switch' ? batchSwitches : filteredStudents;

  const searchedStudents = displayedStudents.filter(student => {
    const searchText = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText) ||
      student.phone?.toLowerCase().includes(searchText) ||
      student.batchName?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-5"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {categoryTitles[category] || 'Student Details'}
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              View and search student records.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
            <span className="text-sm text-slate-500">Total Records: </span>
            <span className="font-bold text-slate-900">
              {searchedStudents.length}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone or batch..."
            className="w-full sm:max-w-md px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500">
            Loading student records...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {searchedStudents.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No student records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {[
                        'Name',
                        'Email',
                        'Phone',
                        'Batch',
                        'Course Status',
                        'Fee',
                        'Project',
                        'Placement Status',
                      ].map(heading => (
                        <th
                          key={heading}
                          className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {searchedStudents.map(student => (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                          {student.name || '—'}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {student.email || '—'}
                        </td>

                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {student.phone || '—'}
                        </td>

                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {student.batchName || '—'}
                        </td>

                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {student.courseStatus || '—'}
                        </td>

                        <td className="px-4 py-3">
                          {student.feeCompleted ? 'Yes' : 'No'}
                        </td>

                        <td className="px-4 py-3">
                          {student.projectCompleted ? 'Yes' : 'No'}
                        </td>

                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {student.placementStatus || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}