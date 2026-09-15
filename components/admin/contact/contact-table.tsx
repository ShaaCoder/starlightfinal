import { ContactSubmission } from "@/types/contact";
import ContactRow from "./contact-row";

type Props = {
  contacts: ContactSubmission[];
  onDelete: (id: string) => void;
};

export default function ContactTable({ contacts, onDelete }: Props) {
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
          Contact Form Submissions
        </h2>

        <p className="text-gray-500 mt-2">
          Enquiries submitted through the Contact Us form
        </p>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full">
          <thead className="bg-blue-50">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Name
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
                Message
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Date
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-blue-900">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="
                    text-center
                    py-16
                    text-gray-400
                  "
                >
                  No contact submissions yet.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
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
