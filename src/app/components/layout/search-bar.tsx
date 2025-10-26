"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchTagsByNameAction } from "@/lib/actions/tag";
import { Prisma } from "@prisma/client";
import { Kbd } from "@/components/ui/kbd";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";

import { useLocale } from "../../contexts/index";

export const SearchBar = () => {
  const { locale } = useLocale();
  const [isMac, setIsMac] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Prisma.TagGetPayload<Prisma.TagDefaultArgs>[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // New state for highlighted suggestion
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length > 0) {
      const response = await searchTagsByNameAction(searchQuery);
      if (response.success && response.data) {
        setSuggestions(response.data);
        setIsOpen(true);
        setHighlightedIndex(-1); // Reset highlight when new suggestions arrive
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query, fetchSuggestions]);

  const handleSelect = useCallback(
    (tagId: string) => {
      // Wrap in useCallback
      router.push(`/tags/${tagId}`);
      setQuery("");
      setIsOpen(false);
      setHighlightedIndex(-1); // Reset highlight
    },
    [router]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + K or Cmd + K shortcut
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }

      // Handle arrow keys and Tab for suggestions
      if (isOpen && suggestions.length > 0) {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlightedIndex((prevIndex) =>
            prevIndex <= 0 ? suggestions.length - 1 : prevIndex - 1
          );
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlightedIndex((prevIndex) =>
            prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1
          );
        } else if (event.key === "Enter" || event.key === "Tab") {
          if (highlightedIndex !== -1) {
            event.preventDefault(); // Prevent form submission or tabbing out
            handleSelect(suggestions[highlightedIndex].id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, suggestions, highlightedIndex, handleSelect]); // Add dependencies

  return (
    <div className="relative w-full max-w-md">
      {/* Added max-w-md for better sizing */}
      <InputGroup>
        <InputGroupInput
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder = {locale('searchbar.search_tag')}
          onFocus={() => query && fetchSuggestions(query)}
          onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        />
        <InputGroupAddon align="inline-end">
          <Kbd className="hidden sm:inline-flex">
            {isMac ? "⌘" : "Ctrl "} {/* Dynamic shortcut display */}
          </Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-background border border-border rounded-md mt-1 shadow-lg">
          {suggestions.map((tag, index) => (
            <li
              key={tag.id}
              onMouseDown={() => handleSelect(tag.id)}
              className={`px-4 py-2 cursor-pointer ${
                index === highlightedIndex ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              {tag.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
