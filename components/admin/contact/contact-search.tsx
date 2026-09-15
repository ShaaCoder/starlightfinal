"use client";

import { Search } from "lucide-react";

type Props = {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
};

export default function ContactSearch({ searchQuery, setSearchQuery }: Props) {
  return (
    <div className="relative w-full md:w-[350px]">
      <Search
        size={18}
        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-gray-400
        "
      />

      <input
        type="text"
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="
          w-full
          h-12
          pl-11
          pr-4
          rounded-xl
          border
          border-blue-100
          outline-none
          focus:border-blue-500
          bg-white
        "
      />
    </div>
  );
}