import { useEffect, useState } from 'react';
import { addStudent, updateStudent } from '../../services/studentService';
import { listBatches } from '../../services/batchService';
import FormField from '../common/FormField';
import {
  COURSE_STATUS,
  FEE_STATUS,
  PROJECT_STATUS,
  PLACEMENT_STATUS,
} from '../../constants/statuses';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  qualification: '',
  passoutYear: '',
  collegeName: '',
  batch: '',
  courseStatus: 'Ongoing',
  feeCompleted: 'false',
  projectCompleted: 'false',
  placementStatus: 'Project not completed',

  moduleEvaluation: '',
  mockPresentation: '',
  trainerFeedback: '',
  hrFeedback: '',

  resumeSession: '',
  interviewSession: '',

  remarks: '',
};

const inputClass =
  'border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-normal bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = 'Enter the student name.';

  if (!form.batch) errors.batch = 'Select a batch.';

  if (!/^\d{10}$/.test(form.phone)) {
    errors.phone = 'Enter a 10-digit phone number.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email.';
  }

  if (
    form.passoutYear &&
    !/^\d{4}$/.test(form.passoutYear)
  ) {
    errors.passoutYear = 'Enter a valid 4-digit passout year.';
  }

  return errors;
}

export default function StudentFormModal({ student, onClose, onSaved }) {
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ...EMPTY,
    ...(student
      ? {
          name: student.name,
          email: student.email,
          phone: student.phone,

          qualification: student.qualification ?? '',
          passoutYear: student.passoutYear
            ? String(student.passoutYear)
            : '',
          collegeName: student.collegeName ?? '',

          batch: String(student.batch),
          courseStatus: student.courseStatus,
          feeCompleted: String(student.feeCompleted),
          projectCompleted: String(student.projectCompleted),
          placementStatus: student.placementStatus,

          moduleEvaluation: student.moduleEvaluation ?? '',
          mockPresentation: student.mockPresentation ?? '',
          trainerFeedback: student.trainerFeedback ?? '',
          hrFeedback: student.hrFeedback ?? '',

          resumeSession:
            student.resumeSession === null
              ? ''
              : String(student.resumeSession),

          interviewSession:
            student.interviewSession === null
              ? ''
              : String(student.interviewSession),

          remarks: student.remarks ?? '',
        }
      : {}),
  });

  useEffect(() => {
    async function fetchBatches() {
      try {
        const data = await listBatches();
        setBatches(data);
      } catch {
        setErrors({
          form: 'Could not load batches. Please try again.',
        });
      } finally {
        setLoadingBatches(false);
      }
    }

    fetchBatches();
  }, []);

  const set = key => e => {
    setForm(prev => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const selectedBatch = batches.find(
    batch => String(batch.id) === form.batch
  );

  const eligible =
    form.feeCompleted === 'true' &&
    form.projectCompleted === 'true' &&
    !['Drop', 'BatchSwitch/dropped'].includes(form.courseStatus);

  const placementLocked = form.projectCompleted !== 'true';

  const placementValue = placementLocked
    ? 'Project not completed'
    : form.placementStatus === 'Project not completed'
      ? 'Placement needed'
      : form.placementStatus;

  const placementOptions = placementLocked
    ? PLACEMENT_STATUS
    : PLACEMENT_STATUS.filter(
        option => option.value !== 'Project not completed'
      );

  const handleSubmit = async e => {
    e.preventDefault();

    if (saving) return;

    const found = validate(form);
    setErrors(found);

    if (Object.keys(found).length) return;

    setSaving(true);

    try {
      const data = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,

        qualification: form.qualification.trim(),
        passoutYear: form.passoutYear
          ? Number(form.passoutYear)
          : null,
        collegeName: form.collegeName.trim(),

        batch: Number(form.batch),
        courseStatus: form.courseStatus,
        feeCompleted: form.feeCompleted === 'true',
        projectCompleted: form.projectCompleted === 'true',
        placementStatus: placementValue,

        moduleEvaluation: form.moduleEvaluation.trim(),
        mockPresentation: form.mockPresentation.trim(),
        trainerFeedback: form.trainerFeedback.trim(),
        hrFeedback: form.hrFeedback.trim(),

        resumeSession:
          form.resumeSession === ''
            ? null
            : form.resumeSession === 'true',

        interviewSession:
          form.interviewSession === ''
            ? null
            : form.interviewSession === 'true',

        remarks: form.remarks.trim(),
      };

      const saved = student
        ? await updateStudent(student.id, data)
        : await addStudent(data);

      onSaved(saved);
    } catch (error) {
      const backendErrors = error.response?.data;

      setErrors({
        form:
          backendErrors?.message ||
          backendErrors?.detail ||
          'Could not save the student. Please check the entered details.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
      >
        <h2 className="text-lg font-bold mb-4">
          {student ? 'Edit Student' : 'Add Student'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Basic Details */}

          <div className="sm:col-span-2">
            <h3 className="font-semibold text-slate-700 border-b pb-2">
              Basic Details
            </h3>
          </div>

          <FormField label="Name" error={errors.name}>
            <input
              className={inputClass}
              value={form.name}
              onChange={set('name')}
            />
          </FormField>

          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={set('email')}
            />
          </FormField>

          <FormField label="Phone" error={errors.phone}>
            <input
              type="tel"
              maxLength={10}
              className={inputClass}
              value={form.phone}
              onChange={set('phone')}
            />
          </FormField>

          <FormField label="Qualification">
            <input
              type="text"
              className={inputClass}
              value={form.qualification}
              onChange={set('qualification')}
              placeholder="e.g. BCA, MCA, B.Tech"
            />
          </FormField>

          <FormField label="Passout Year" error={errors.passoutYear}>
            <input
              type="number"
              min="1900"
              max="9999"
              className={inputClass}
              value={form.passoutYear}
              onChange={set('passoutYear')}
              placeholder="e.g. 2025"
            />
          </FormField>

          <FormField label="College Name">
            <input
              type="text"
              className={inputClass}
              value={form.collegeName}
              onChange={set('collegeName')}
              placeholder="Enter college name"
            />
          </FormField>

          <FormField label="Batch" error={errors.batch}>
            <select
              className={inputClass}
              value={form.batch}
              onChange={set('batch')}
              disabled={!!student || loadingBatches}
            >
              <option value="">
                {loadingBatches ? 'Loading batches...' : 'Select batch'}
              </option>

              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.course} {batch.month} {batch.year} - B
                  {batch.batch_number}
                </option>
              ))}
            </select>

            {student && (
              <span className="text-xs text-slate-500">
                Use Switch Batch to change the student's batch.
              </span>
            )}
          </FormField>

          {selectedBatch && (
            <div className="sm:col-span-2 bg-slate-50 rounded-lg p-3 text-sm">
              <p><strong>Course:</strong> {selectedBatch.course}</p>
              <p><strong>Month:</strong> {selectedBatch.month}</p>
              <p><strong>Year:</strong> {selectedBatch.year}</p>
              <p><strong>Batch number:</strong> {selectedBatch.batch_number}</p>
            </div>
          )}

          {/* Course Details */}

          <div className="sm:col-span-2 mt-2">
            <h3 className="font-semibold text-slate-700 border-b pb-2">
              Course Details
            </h3>
          </div>

          <FormField label="Course status">
            <select
              className={inputClass}
              value={form.courseStatus}
              onChange={set('courseStatus')}
            >
              {COURSE_STATUS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Fee completed">
            <select
              className={inputClass}
              value={form.feeCompleted}
              onChange={set('feeCompleted')}
            >
              {FEE_STATUS.map(option => (
                <option
                  key={option.value}
                  value={option.value === 'yes' ? 'true' : 'false'}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Project completed">
            <select
              className={inputClass}
              value={form.projectCompleted}
              onChange={set('projectCompleted')}
            >
              {PROJECT_STATUS.map(option => (
                <option
                  key={option.value}
                  value={option.value === 'yes' ? 'true' : 'false'}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Placement status">
            <select
              className={inputClass}
              value={placementValue}
              onChange={set('placementStatus')}
              disabled={placementLocked}
            >
              {placementOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex items-end">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                eligible
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {eligible ? 'Eligible' : 'Not eligible'}
            </span>
          </div>

          {/* Evaluation and Feedback */}

          <div className="sm:col-span-2 mt-2">
            <h3 className="font-semibold text-slate-700 border-b pb-2">
              Evaluation and Feedback
            </h3>
          </div>

          <FormField label="Module Evaluation">
            <textarea
              className={inputClass}
              rows={2}
              value={form.moduleEvaluation}
              onChange={set('moduleEvaluation')}
              placeholder="Enter module evaluation"
            />
          </FormField>

          <FormField label="Mock and Presentation">
            <textarea
              className={inputClass}
              rows={2}
              value={form.mockPresentation}
              onChange={set('mockPresentation')}
              placeholder="Enter mock and presentation details"
            />
          </FormField>

          <FormField label="Trainer Feedback">
            <textarea
              className={inputClass}
              rows={3}
              value={form.trainerFeedback}
              onChange={set('trainerFeedback')}
              placeholder="Enter trainer feedback"
            />
          </FormField>

          <FormField label="HR Feedback">
            <textarea
              className={inputClass}
              rows={3}
              value={form.hrFeedback}
              onChange={set('hrFeedback')}
              placeholder="Enter HR feedback"
            />
          </FormField>

          {/* Session Attendance */}

          <div className="sm:col-span-2 mt-2">
            <h3 className="font-semibold text-slate-700 border-b pb-2">
              Session Attendance
            </h3>
          </div>

          <FormField label="Resume Session">
            <select
              className={inputClass}
              value={form.resumeSession}
              onChange={set('resumeSession')}
            >
              <option value="">Not recorded</option>
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </select>
          </FormField>

          <FormField label="Interview Session">
            <select
              className={inputClass}
              value={form.interviewSession}
              onChange={set('interviewSession')}
            >
              <option value="">Not recorded</option>
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </select>
          </FormField>

          {/* Remarks */}

          <div className="sm:col-span-2 mt-2">
            <FormField label="Remarks / closure">
              <textarea
                className={inputClass}
                rows={3}
                value={form.remarks}
                onChange={set('remarks')}
              />
            </FormField>
          </div>
        </div>

        {errors.form && (
          <p className="text-red-500 text-sm mt-3">{errors.form}</p>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300"
          >
            Cancel
          </button>

          <button
            disabled={saving || loadingBatches}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : student
                ? 'Save Changes'
                : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}