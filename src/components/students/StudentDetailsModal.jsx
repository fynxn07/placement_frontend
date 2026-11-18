import { X } from 'lucide-react';

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-800 break-words">
        {value ?? '-'}
      </p>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="border border-slate-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">
        {title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAttendance(value) {
  if (value === true) return 'Present';
  if (value === false) return 'Absent';

  return 'Not recorded';
}

export default function StudentDetailsModal({ student, onClose }) {
  if (!student) return null;

  const eligibility =
    student.feeCompleted &&
    student.projectCompleted &&
    !['drop', 'batchswitch_dropped'].includes(
      student.courseStatus?.toLowerCase()
    );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Student Details
            </h2>

            <p className="text-sm text-slate-500">
              {student.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        <div className="p-6 overflow-y-auto space-y-4">

          {/* Personal Details */}
          <DetailSection title="Personal Details">
            <DetailItem label="Name" value={student.name} />
            <DetailItem label="Email" value={student.email} />
            <DetailItem label="Phone" value={student.phone} />
            <DetailItem label="Qualification" value={student.qualification} />
            <DetailItem label="Passout Year" value={student.passoutYear} />
            <DetailItem label="College Name" value={student.collegeName} />
            <DetailItem label="Batch" value={student.batchName} />
          </DetailSection>

          {/* Course & Placement Details */}
          <DetailSection title="Course & Placement Details">
            <DetailItem label="Course Status" value={student.courseStatus} />
            <DetailItem
              label="Fee Status"
              value={student.feeCompleted ? 'Completed' : 'Pending'}
            />
            <DetailItem
              label="Project Status"
              value={student.projectCompleted ? 'Completed' : 'Pending'}
            />
            <DetailItem
              label="Eligibility"
              value={eligibility ? 'Eligible' : 'Not Eligible'}
            />
            <DetailItem
              label="Placement Status"
              value={student.placementStatus}
            />
            <DetailItem label="Remarks" value={student.remarks} />
          </DetailSection>

          {/* Evaluation & Feedback */}
          <DetailSection title="Evaluation & Feedback">
            <DetailItem
              label="Module Evaluation"
              value={student.moduleEvaluation}
            />
            <DetailItem
              label="Mock & Presentation"
              value={student.mockPresentation}
            />
            <DetailItem
              label="Trainer Feedback"
              value={student.trainerFeedback}
            />
            <DetailItem
              label="HR Feedback"
              value={student.hrFeedback}
            />
          </DetailSection>

          {/* Session Attendance */}
          <DetailSection title="Session Attendance">
            <DetailItem
              label="Resume Session"
              value={formatAttendance(student.resumeSession)}
            />
            <DetailItem
              label="Interview Session"
              value={formatAttendance(student.interviewSession)}
            />
          </DetailSection>

          {/* Record Information */}
          <DetailSection title="Record Information">
            <DetailItem
              label="Last Updated By"
              value={student.updatedBy}
            />
            <DetailItem
              label="Updated Date"
              value={formatDate(student.updatedAt)}
            />
          </DetailSection>

        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}