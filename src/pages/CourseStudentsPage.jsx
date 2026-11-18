import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import FilterSelect from '../components/common/FilterSelect';
import { listBatches, deleteBatch } from '../services/batchService';
import { listStudents } from '../services/studentService';
import { Trash2, X } from 'lucide-react';

import {
  COURSE_STATUS,
  PLACEMENT_STATUS,
  labelOf,
} from '../constants/statuses';

const COLUMNS = [
  { header: 'Name', render: s => s.name },
  { header: 'Email', render: s => s.email },
  { header: 'Phone', render: s => s.phone },
  {
    header: 'Course Status',
    render: s => labelOf(COURSE_STATUS, s.courseStatus),
  },
  {
    header: 'Fee Status',
    render: s => (s.feeCompleted ? 'Completed' : 'Pending'),
  },
  {
    header: 'Project Status',
    render: s => (s.projectCompleted ? 'Completed' : 'Pending'),
  },
  {
    header: 'Eligibility',
    render: s => (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          s.eligible
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-amber-100 text-amber-700'
        }`}
      >
        {s.eligible ? 'Yes' : 'No'}
      </span>
    ),
  },
  {
    header: 'Placement Status',
    render: s => labelOf(PLACEMENT_STATUS, s.placementStatus),
  },
];

const CARD = 'bg-white border border-slate-200 rounded-xl p-4';

export default function CourseStudentsPage() {
  const { course } = useParams();

  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [batch, setBatch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Batch deletion states
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');

        const [batchData, studentData] = await Promise.all([
          listBatches(),
          listStudents(),
        ]);

        setBatches(batchData);
        setStudents(studentData);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load course students.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const courseBatches = batches.filter(b => b.course === course);

  const isValidCourse = courseBatches.length > 0;

  const batchIds = new Set(courseBatches.map(b => b.id));

  const courseStudents = students
    .filter(s => batchIds.has(Number(s.batch)))
    .sort((a, b) => a.name.localeCompare(b.name));

  const monthOptions = [...new Set(courseBatches.map(b => b.month))]
    .sort()
    .map(m => ({ value: m, label: m }));

  const yearOptions = [...new Set(courseBatches.map(b => b.year))]
    .sort((a, b) => a - b)
    .map(y => ({ value: y, label: String(y) }));

  const batchOptions = courseBatches.map(b => ({
    value: String(b.id),
    label: `${b.month} ${b.year} - Batch ${b.batch_number}`,
  }));

  const visibleStudents = courseStudents.filter(student => {
    const studentBatch = courseBatches.find(
      b => b.id === Number(student.batch)
    );

    return (
      (!batch || String(student.batch) === batch) &&
      (!month || studentBatch?.month === month) &&
      (!year || String(studentBatch?.year) === year)
    );
  });

  const total = visibleStudents.length;

  const eligibleCount = visibleStudents.filter(s => s.eligible).length;

  const notEligibleCount = total - eligibleCount;

  // Delete selected batch
  async function handleDeleteBatch() {
    if (!deletingBatch || isDeleting) return;

    try {
      setIsDeleting(true);
      setDeleteError('');

      await deleteBatch(deletingBatch.id);

      // Remove deleted batch from the frontend
      setBatches(prev =>
        prev.filter(b => b.id !== deletingBatch.id)
      );

      // Clear batch filter if the deleted batch was selected
      if (batch === String(deletingBatch.id)) {
        setBatch('');
      }

      setDeletingBatch(null);
    } catch (err) {
      setDeleteError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to delete batch. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function closeDeleteModal() {
    if (isDeleting) return;

    setDeletingBatch(null);
    setDeleteError('');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Link to="/batches" className="text-sm text-blue-600 hover:underline">
          ← Back to Courses
        </Link>

        {loading && <p className="mt-6 text-slate-500">Loading students...</p>}

        {error && <p className="mt-6 text-red-500">{error}</p>}

        {!loading && !error && !isValidCourse && (
          <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-slate-700 font-medium">
              This course has no batches remaining.
            </p>

            <Link
              to="/batches"
              className="inline-block mt-3 text-sm text-blue-600 hover:underline"
            >
              Back to Courses
            </Link>
          </div>
        )}

        {!loading && !error && isValidCourse && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mt-3 mb-5">
              {course}
            </h1>

            {/* Batch Management */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                Manage Batches
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseBatches.map(item => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-center gap-3"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Batch {item.batch_number}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {item.month} {item.year}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setDeletingBatch(item);
                        setDeleteError('');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Student Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <FilterSelect
                label="Batch"
                value={batch}
                onChange={setBatch}
                options={batchOptions}
              />

              <FilterSelect
                label="Month"
                value={month}
                onChange={setMonth}
                options={monthOptions}
              />

              <FilterSelect
                label="Year"
                value={year}
                onChange={setYear}
                options={yearOptions}
              />
            </div>

            {(batch || month || year) && (
              <button
                onClick={() => {
                  setBatch('');
                  setMonth('');
                  setYear('');
                }}
                className="text-sm text-blue-600 hover:underline mb-3"
              >
                Clear filters
              </button>
            )}

            {/* Student Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className={CARD}>
                <p className="text-sm text-slate-500">Total students</p>

                <p className="text-3xl font-black text-slate-900">{total}</p>
              </div>

              <div className={CARD}>
                <p className="text-sm text-slate-500">Eligible</p>

                <p className="text-3xl font-black text-emerald-600">
                  {eligibleCount}
                </p>
              </div>

              <div className={CARD}>
                <p className="text-sm text-slate-500">Not eligible</p>

                <p className="text-3xl font-black text-amber-600">
                  {notEligibleCount}
                </p>
              </div>
            </div>

            {/* Student Table */}
            {courseStudents.length === 0 ? (
              <p>No students enrolled in this course yet.</p>
            ) : visibleStudents.length === 0 ? (
              <p>No students match these filters.</p>
            ) : (
              <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-orange-950 text-white">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Sl. No</th>

                      {COLUMNS.map(c => (
                        <th key={c.header} className="px-3 py-2 font-semibold">
                          {c.header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-amber-100">
                        <td className="px-3 py-2">{index + 1}</td>

                        {COLUMNS.map(c => (
                          <td
                            key={c.header}
                            className="px-3 py-2 whitespace-nowrap"
                          >
                            {c.render(student)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deletingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Delete Batch
              </h2>

              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="text-slate-400 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-2">
              Are you sure you want to delete this batch?
            </p>

            <p className="font-semibold text-slate-800 mb-4">
              {deletingBatch.course} - Batch {deletingBatch.batch_number}
              {' '}({deletingBatch.month} {deletingBatch.year})
            </p>

            {courseBatches.length === 1 && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 mb-4">
                This is the last batch in this course. Deleting it will also
                remove the course from the Courses page.
              </p>
            )}

            {deleteError && (
              <div className="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteBatch}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Batch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}