import React, { useState, useCallback } from 'react';

interface TagsInputProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

export const TagsInput: React.FC<TagsInputProps> = ({ tags, setTags }) => {
    const [input, setInput] = useState('');

    const addTag = useCallback(() => {
        if (input.trim() && !tags.includes(input.trim())) {
            setTags([...tags, input.trim()]);
            setInput(''); // Clear the input field after adding the tag
        }
    }, [input, tags, setTags]);

    const removeTag = useCallback((index: number) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        setTags(newTags);
    }, [tags, setTags]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div className="flex flex-wrap items-center border rounded-lg p-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-200">
            {tags.map((tag, index) => (
                <div key={index} className="flex items-center bg-blue-500 text-white rounded-full px-3 py-1 m-1">
                    <span>{tag}</span>
                    <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 focus:outline-none"
                    >
                        &times;
                    </button>
                </div>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag and press Enter"
                className="flex-grow p-2 bg-transparent border-none focus:outline-none"
            />
            <button
                type="button"
                onClick={addTag}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 ml-2 hover:bg-blue-700 focus:outline-none transition duration-150 ease-in-out"
            >
                Add
            </button>
        </div>
    );
};
