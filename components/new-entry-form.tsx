import React, { useEffect, useState } from 'react';
import { Entry, useEntry } from '@contexts/entries-context';

import { Input, TextArea } from '@components/form-elements.client';
import DatePicker from '@components/datepicker.client';
import { formatDate, roundToNearestQuarterAndFormat } from '@components/helpers/datetime.format';
import TagSelector from '@components/tag-selector.client';
import { TagData } from './schemes/api-tag';

interface ErrorMessages {
    element: string
    error: string
}

const NewEntryForm: React.FC = () => {
    const [placeholder, setPlaceholder] = useState(roundToNearestQuarterAndFormat(new Date()));
    const [response, setResponse] = useState<ErrorMessages[]>([]);
    const { createEntry } = useEntry();

    const [formData, setFormData] = useState<Entry>(
        { date: new Date(Date.now()), starttime: '', endtime: '', description: '', notes: '', tags: [] });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, placeholder?: string) => {
        const { name, value } = e.target;
        const _name = name.replaceAll(" ", "").toLocaleLowerCase();
        setFormData(prev => ({ ...prev, [_name]: placeholder ? placeholder : value }));
    };

    const handleEnterPress = (value: string) => {
        setFormData(prev => ({ ...prev, notes: value + '\n' }));
    }

    const handleDate = (date) => {
        setFormData(prev => ({
            ...prev,
            date: new Date(date)
        }));
    }

    const handleTags = (newTags: TagData[] | ((tags: TagData[]) => TagData[])) => {
        let updatedTags = [];

        if (typeof newTags === 'function') {
            updatedTags = newTags(formData.tags);
        } else if (Array.isArray(newTags)) {
            updatedTags = newTags;
        } else {
            console.error('Provided newTags are not valid:', newTags);
            return;
        }

        setFormData(prev => ({
            ...prev,
            tags: updatedTags
        }));
    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const promise = await createEntry(formData);
        if (promise.error != null) {
            const errors = promise.error.split(', ');
            const errorArray = [] as ErrorMessages[];
            errors.forEach(element => {
                const formElement = element.match(/"(.*?)"/)[1];
                const error = element.replace(/^[^\s]+\s+/, '');
                errorArray.push({
                    element: formElement,
                    error: error
                });
            });
            setResponse(errorArray);
        }
        else {
            setResponse([]);
            setFormData({ date: new Date(Date.now()), starttime: '', endtime: '', description: '', notes: '', tags: [] });
        }
    };

    useEffect(() => {
        const updatePlaceholder = () => {
            const newPlaceholder = roundToNearestQuarterAndFormat(new Date());
            setPlaceholder(newPlaceholder);
        };

        const intervalId = setInterval(updatePlaceholder, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    };

    const hanldeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        const name = e.target.name;
        const _name = name.replaceAll(" ", "").toLocaleLowerCase();
        value = value.replace(/[^0-9:]/g, '');

        if (value.includes(':') && value.lastIndexOf(':') !== value.indexOf(':')) {
            value = value.substring(0, value.lastIndexOf(':'));
        }

        if (value.length > 2 && value[2] !== ':') {
            value = value.substring(0, 2) + ':' + value.substring(2);
        }

        if (value.length > 5) {
            value = value.substring(0, 5);
        }

        setFormData(prev => ({ ...prev, [_name]: value }));
    };

    return (
        <form onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
            <div className="relative mt-5">
                <DatePicker setDates={handleDate} title="Date" placeholder={formatDate(new Date(Date.now()))} startAndEndDate={false} />
            </div>

            <div className="flex justify-items-stretch space-x-2">
                <Input value={formData.starttime} setValueOnDoubleClick={handleChange} setValueOnChange={hanldeTimeChange} title="Start Time" placeholder={placeholder}
                    error={response.find(e => e.element == 'start_time')?.error} />
                <Input value={formData.endtime} setValueOnDoubleClick={handleChange} setValueOnChange={hanldeTimeChange} title="End Time" placeholder={placeholder} error={response.find(e => e.element == 'end_time')?.error} />
            </div>

            <Input value={formData.description} setValueOnChange={handleChange} title="Description" placeholder="Description" error={response.find(e => e.element == 'description')?.error} />
            <TextArea value={formData.notes} setValueOnChange={handleChange} setValueOnEnter={handleEnterPress} title="Notes" placeholder="Notes" error={response.find(e => e.element == 'notes')?.error} />

            <div className="relative mt-5">
                <TagSelector selectedTags={formData.tags} setselectedTags={handleTags} error={response.find(e => e.element == 'tags')?.error} />
            </div>

            {response.length != 0 && <div className={`mt-2 text-xs text-center ${response.length != 0 ? 'text-red-500' : 'text-gray-400'} `}>Entry was not inserted</div>}
            <div className="relative flex justify-center items-center mt-2">
                <button className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-7 text-xs rounded-md" type="submit">
                    Submit
                </button>
            </div>
        </form>
    );
};

export default NewEntryForm;