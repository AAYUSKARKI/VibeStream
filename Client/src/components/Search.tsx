import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { FaSearchLocation } from "react-icons/fa";
import useGetsuggestions from "../hooks/useGetsearchsuggestion";

function Search() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const { data: suggestions, isLoading, isError } = useGetsuggestions(query);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const handleSearch = () => {
        if (query.trim().length > 0) {
            navigate(`/search?query=${query}`);
            setQuery("");
            setFocusedIndex(null); // Reset focus when query changes
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        setFocusedIndex(null); // Reset focus when query changes
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (focusedIndex !== null && suggestions) {
                handleSuggestionClick(suggestions[focusedIndex]);
            } else {
                handleSearch();
            }
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            if (suggestions && suggestions.length > 0) {
                setFocusedIndex((prevIndex) => (prevIndex === null ? 0 : Math.min(prevIndex + 1, suggestions.length - 1)));
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (suggestions && suggestions.length > 0) {
                setFocusedIndex((prevIndex) => (prevIndex === null ? 0 : Math.max(prevIndex - 1, 0)));
            }
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        handleSearch();
    };

    const handleSuggestionMouseEnter = (index: number) => {
        setFocusedIndex(index);
    };

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error fetching suggestions.</p>;

    return (
        <div className="relative">
            <div className="dark:text-white text-black flex items-center gap-2 w-full p-2 rounded-full bg-white dark:bg-gray-800 shadow shadow-gray-300 dark:shadow-gray-700 text-lg">
                <input
                    type="text"
                    placeholder="Search"
                    value={query}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent focus:outline-none"
                    onChange={handleChange}
                />
                <button
                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow shadow-gray-300 dark:shadow-gray-700 hover:scale-105 duration-100 ease-in"
                    onClick={handleSearch}
                >
                    <FaSearchLocation />
                </button>
            </div>
            {query && suggestions && suggestions.length > 0 && (
                <div
                    className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow shadow-gray-300 dark:shadow-gray-700 rounded-lg mt-2"
                    ref={suggestionsRef}
                >
                    {suggestions.map((suggestion: string, index: number) => (
                        <div
                            key={suggestion}
                            className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer ${index === focusedIndex ? 'bg-gray-300 dark:bg-gray-600' : ''}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseEnter={() => handleSuggestionMouseEnter(index)}
                            role="button"
                            tabIndex={0}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Search;
