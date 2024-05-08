import { useEffect, useRef, useState } from "react";
import { HttpRequest, HttpRequestPromise } from "./http-request";
import Tag from "./tag.client";
import { TagData } from "./schemes/api-tag";

interface TagSelectorProps {
    selectedTags: TagData[]
    setselectedTags: Function
    error?: string
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, setselectedTags, error }) => {
    const { response, isLoading } = HttpRequest(`/api/tags`);

    const [inputValue, setInputValue] = useState('');
    const [hint, setHint] = useState('');
    const [something, setSomething] = useState('');
    const [inputWidth, setInputWidth] = useState(0);
    const hiddenSpanRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (hiddenSpanRef.current) {
            setInputWidth(hiddenSpanRef.current.offsetWidth);
        }
    }, [inputValue]);

    const handleAddTag = () => {
        const fullSuggestion = inputValue + hint;
        if (fullSuggestion && !selectedTags.some(i => i.value === fullSuggestion)) {
            const tagObjInData = response.data.find(i => i.value.includes(fullSuggestion));
            const tagObjInSuggestions = selectedTags.find(i => i.value.includes(fullSuggestion));

            if (tagObjInData !== undefined && tagObjInSuggestions === undefined) {
                setselectedTags(prevValues => [...prevValues, tagObjInData]);
            } else {
                HttpRequestPromise('/api/tag', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        value: fullSuggestion,
                        color: 'orange'
                    })
                })
                    .then((data) => {
                        if (data) {
                            setselectedTags([...selectedTags, { value: fullSuggestion, color: 'orange' }]);
                        } else {
                            setSomething('Api Error: no tag added!');
                        }
                    });
            }
            setInputValue('');
            setHint('');
            setSomething('');
        } else if (inputValue) {
            setHint('');
            setSomething('');
        }
    };

    const handleInputChange = (event) => {
        const { value } = event.target;
        setInputValue(value);
        if (value) {
            const filteredSuggestions = response.data.filter(tag =>
                tag.value.toLowerCase().startsWith(value.toLowerCase()) && !selectedTags.includes(tag)
            );
            if (filteredSuggestions.length > 0) {
                setHint(filteredSuggestions[0].value.slice(value.length));
                setSomething('');
            } else {
                setHint('');
                setSomething(`Create '${inputValue}' as new tag`);
            }
        } else {
            setHint('');
            setSomething('');
        }
    };

    const handleRemovetag = (tagToRemove) => {
        const tagObj = selectedTags.find(i => i.value.includes(tagToRemove));
        setselectedTags(selectedTags.filter(b => b.value !== tagObj.value));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter')
            handleAddTag();
        if (e.key === 'Tab') {
            e.preventDefault();
            const fullSuggestion = inputValue + hint;
            setInputValue(fullSuggestion);
            setHint('');
        }
    }

    if (isLoading)
        return (<p>Loading Tags...</p>);

    return (
        <div className="relative mt-5 w-full">
            <div className="relative w-full">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag..."
                    className={`peer block w-full rounded-md border-0 py-2.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm bg-slate-200 ${error != null && error != undefined && ' ring-red-400 ring-2'}`}
                    ref={inputRef}
                />
                {error != null && error != "" && <p className="text-red-400 text-xs">{error}</p>}
                <label
                    className={`absolute left-3 -top-2.5 text-gray-500 transition-all duration-200 ease-in-out  peer-focus:text-indigo-600 peer-focus:text-sm bg-slate-200 px-2 text-sm font-medium ${error != null && error != "" && " text-red-400"}`}
                >
                    Tag(s)
                </label>

                <span ref={hiddenSpanRef} className="absolute white-space-pre left-3 top-0 opacity-0 pointer-events-none text-sm">
                    {inputValue}
                </span>

                <span className="absolute top-[10px] left-0 pl-[0.76rem] pointer-events-none select-none text-gray-400 text-sm" style={{ marginLeft: `${inputWidth}px` }}>
                    {hint}
                </span>
            </div>

            <ul className="z-10 list-none w-full mt-1 flex text-gray-500 ml-1 text-xs">
                {something}
            </ul>

            <div className="flex flex-wrap pt-2">
                {selectedTags.map(tag => (
                    <Tag key={tag.value} color={tag.color} text={tag.value} onRemove={handleRemovetag} />
                ))}
            </div>
        </div>
    );
};

export default TagSelector;