"use client";

import { useState } from "react";
import { toast } from "sonner";
import { contacts as initialContacts } from "@/lib/data/contacts";
import { ContactSubmission } from "@/types/contact";

import ContactFilters from "./contact-filters";
import ContactSearch from "./contact-search";
import ContactTable from "./contact-table";

export default function ContactSection() {
  const [contacts, setContacts] = useState<ContactSubmission[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);

    const matchesCourse =
      courseFilter === "All Courses" || contact.course === courseFilter;

    return matchesSearch && matchesCourse;
  });

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
    toast.success("Contact submission deleted successfully!");
  };

  return (
    <div className="space-y-5">
      {/* TOPBAR */}
      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
        "
      >
        <ContactSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ContactFilters
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
        />
      </div>

      {/* TABLE */}
      <ContactTable contacts={filteredContacts} onDelete={handleDeleteContact} />
    </div>
  );
}