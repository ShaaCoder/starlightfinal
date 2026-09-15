import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Contact Starlight Academy | Rohini Sector 5 Delhi",

  description:
    "Contact Starlight Academy in Rohini Sector 5, Delhi for admissions, NIOS guidance, career counseling, library membership, undergraduate, postgraduate, teacher training and healthcare courses.",

  keywords: [
    "Contact Vihaan Education Academy",
    "Contact Vihaan Library",
    "Library Rohini",
    "Library Rohini Sector 5",
    "Education Academy Rohini",
    "NIOS Admission Rohini",
    "Career Counseling Delhi",
    "Library Membership Rohini",
    "Study Library Delhi",
    "Admission Guidance Delhi",
  ],
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}