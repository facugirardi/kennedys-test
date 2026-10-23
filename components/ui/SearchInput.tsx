"use client";

import { Search } from "lucide-react";
import React, { useState } from "react";

export const SearchInput = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-10 w-96 rounded-md border border-gray-300 
                   pl-3 pr-10 py-2 focus:outline-none 
                   focus:ring-1 focus:ring-gray-400"
      />
      {/* Icon positioned on the right of the input */}
      <Search className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
    </div>
  );
};
