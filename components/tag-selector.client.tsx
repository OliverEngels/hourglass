import { useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";
import { HttpRequestPromise } from "./http-request";
import { Tag, createTag, createTags, deleteTag } from "@redux/reducers/tags";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import TagElement from '@components/tag.client';
import { useDispatch } from "@redux/hooks";

interface TagSelectorProps {
    selectedTags: Tag[];
    setSelectedTags: (tags: Tag[]) => void;
    error?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, setSelectedTags, error }) => {
    const tags = useSelector((state: RootState) => state.tagState.tags);
    const [inputValue, setInputValue] = useState('');
    const [hint, setHint] = useState('');
    const [message, setMessage] = useState('');
    const [inputWidth, setInputWidth] = useState(0);
    const hiddenSpanRef = useRef<HTMLSpanElement>(null);

    const dispatch = useDispatch();

    useEffect(() => {
        const handleDataUpdate = (response: any) => {
            if (response.update == "delete-tag") {
                response.data.map(tagValue => {
                    const tag = tags.find(t => t.value == tagValue);
                    dispatch(deleteTag({ id: tag.id }));
                });
                handleRemoveTag(response.data);
            }
            if (response.update == "add-tag") {
                const existingTag = tags.find(tag => tag.value == response.data.value);
                if (!existingTag)
                    dispatch(createTag(response.data));
            }
        };

        const cleanupListener = window.electron.onDataUpdate(handleDataUpdate);

        return () => {
            if (typeof cleanupListener === 'function') {
                //@ts-ignore
                cleanupListener();
            }
        };
    }, [tags]);

    useEffect(() => {
        handleTags();
    }, [dispatch]);

    const handleTags = () => {
        HttpRequestPromise(`/api/tags`)
            .then((response) => {
                dispatch(createTags(response.data));
            });
    }

    useEffect(() => {
        if (hiddenSpanRef.current) {
            setInputWidth(hiddenSpanRef.current.offsetWidth);
        }
    }, [inputValue]);

    const handleAddTag = () => {
        const existingTag = tags.find(tag => tag.value == inputValue);

        if (existingTag) {
            setSelectedTags([...selectedTags, existingTag]);
        } else {
            HttpRequestPromise('/api/tag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: inputValue, color: 'gray' })
            })
                .then((data) => {
                    if (data) {
                        const newTag = { id: data.data.objectId, value: inputValue, color: 'gray', subtype: 'misc' };
                        dispatch(createTag(newTag));
                        setSelectedTags([...selectedTags, newTag]);
                        window.electron.sendUpdate({ update: "add-tag", data: newTag });
                    } else {
                        setMessage('API Error: no tag added!');
                    }
                });
        }
        setInputValue('');
        setHint('');
        setMessage('');
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setInputValue(value);

        if (value) {
            const filteredSuggestions = tags.filter(tag =>
                tag.value.toLowerCase().startsWith(value.toLowerCase()) && !selectedTags.includes(tag)
            );
            if (filteredSuggestions.length > 0) {
                setHint(filteredSuggestions[0].value.slice(value.length));
                setMessage('');
            } else {
                setHint('');
                setMessage(`Create '${value}' as a new tag`);
            }
        } else {
            setHint('');
            setMessage('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag.value !== tagToRemove));
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleAddTag();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            setInputValue(inputValue + hint);
            setHint('');
        }
    };

    return (
        <div className="relative mt-5 w-full">
            <div className="relative w-full">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag..."
                    className={`peer block w-full rounded-md border-0 py-2.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm bg-slate-200 ${error && ' ring-red-400 ring-2'}`}
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <label className={`absolute left-3 -top-2.5 text-gray-500 transition-all duration-200 ease-in-out peer-focus:text-indigo-600 peer-focus:text-sm bg-slate-200 px-2 text-sm font-medium ${error && 'text-red-400'}`}>
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
                {message}
            </ul>

            <div className="flex flex-wrap pt-2">
                {selectedTags.map((b, j) => {
                    const tag = tags.find(t => t.value == b.value);
                    if (tag)
                        return <TagElement
                            key={`badge-${tag.id}-${j}`}
                            color={tag.color}
                            text={tag.value}
                            onRemove={() => handleRemoveTag(tag.value)} />
                })}
            </div>
        </div>
    );
};

export default TagSelector;