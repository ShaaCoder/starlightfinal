import { Admission } from "@/types/admission";
import AdmissionRow from "./admission-row";

type Props = {
  admissions: Admission[];
  onUpdateStatus: (id: string, status: Admission["status"]) => void;
  onDelete: (id: string) => void;
};

export default function AdmissionsTable({
  admissions,
  onUpdateStatus,
  onDelete,
}: Props) {
  return (
    <div
      className="
        bg-white
        border
        border-blue-100
        rounded-2xl
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="border-b border-blue-100 p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-blue-900 sm:text-3xl">
          Admission Applications
        </h2>

        <p className="text-gray-500 mt-2">
          Review and manage admission applications from the website
        </p>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full">
          <thead className="bg-blue-50">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Student
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Phone
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Email
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Course
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Class
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Subjects
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Parent
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Status
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {admissions.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="
                    text-center
                    py-16
                    text-gray-400
                  "
                >
                  No admission applications yet.
                </td>
              </tr>
            ) : (
              admissions.map((admission) => (
                <AdmissionRow
                  key={admission.id}
                  admission={admission}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
