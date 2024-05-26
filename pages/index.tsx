import React, { useEffect, useState } from 'react';

import { Input, TextArea } from '@components/form-elements.client';
import DatePicker from '@components/datepicker.client';
import { formatDate, roundToNearestQuarterAndFormat } from '@components/helpers/datetime.format';
import TagSelector from '@components/tag-selector.client';
import { Tag, updateTag } from "@redux/reducers/tags";
import { simple_hash } from '@components/helpers/encryption';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { useDispatch } from '@redux/hooks';
import { setLog, updateLog } from '@redux/reducers/log';
import { HttpRequestPromise } from '@components/http-request';

interface ErrorMessages {
    element: string
    error: string
}

export default function Home() {
    const [serverIp, setServerIp] = useState(undefined);
    const [uniqueId, setUniqueId] = useState(undefined);
    const [placeholder, setPlaceholder] = useState(roundToNearestQuarterAndFormat(new Date()));
    const [response, setResponse] = useState<ErrorMessages[]>([]);

    const log = useSelector((state: RootState) => state.logState);
    const tags = useSelector((state: RootState) => state.tagState.tags);
    const dispatch = useDispatch();

    const [serverIpForm, setServerIpForm] = useState('');

    useEffect(() => {
        const handleDataUpdate = (response: any) => {
            if (response.update == "tag") {
                dispatch(updateTag({ id: response.data.id, updatedTagData: response.data }));
            }
            if (response.update == 'select-entry') {
                const obj2Map = new Map(response.data.tags.map(obj => [obj.value, obj]));
                const matchingObjects = tags.filter(obj1 => obj2Map.has(obj1.value));
                dispatch(updateLog({ ...response.data, tags: matchingObjects }));
            }
        };

        const cleanupListener = window.electron.onDataUpdate(handleDataUpdate);

        return () => {
            if (typeof cleanupListener === 'function') {
                //@ts-ignore
                cleanupListener();
            }
        };
    }, [log]);

    const updateData = (newData: any) => {
        window.electron.sendUpdate(newData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, placeholder?: string) => {
        const { name, value } = e.target;
        const _name = name.replaceAll(" ", "").toLocaleLowerCase();
        dispatch(updateLog({ [_name]: placeholder ? placeholder : value }));
    };

    const handleEnterPress = (value: string) => {
        dispatch(updateLog({ notes: value + '\n' }));
    }

    const handleDate = (date) => {
        const newDate = new Date(date.startDate);
        newDate.setHours(12);
        dispatch(updateLog({ date: newDate.toISOString() }));
    }

    const handleClear = (e) => {
        e.preventDefault();

        dispatch(updateLog({
            id: '',
            date: new Date(Date.now()).toISOString(),
            starttime: '',
            endtime: '',
            description: '',
            notes: '',
            tags: []
        }));
        setResponse([]);
    }

    const handleTags = (newTags: Tag[] | ((tags: Tag[]) => Tag[])) => {
        let updatedTags = [];

        if (typeof newTags === 'function') {
            updatedTags = newTags(log.tags);
        } else if (Array.isArray(newTags)) {
            updatedTags = newTags;
        } else {
            console.error('Provided newTags are not valid:', newTags);
            return;
        }

        dispatch(updateLog({ tags: updatedTags }));
    };

    useEffect(() => {
        const obj2Map = new Map(log.tags.map(obj => [obj.id, obj]));
        const matchingObjects = tags.filter(obj1 => obj2Map.has(obj1.id));
        dispatch(updateLog({ tags: matchingObjects }))
    }, [tags]);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (log.id != '') {
            HttpRequestPromise(`/api/entry/${log.id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(log)
                }
            ).then(_response => {
                updateData({
                    update: 'update-entry',
                    data: log
                })
                handleClearLog();
            }).catch(error => handleError(error));
        } else {
            HttpRequestPromise('/api/entry',
                {
                    method: 'POST',
                    body: JSON.stringify(log)
                }
            ).then(_response => {
                updateData({
                    update: 'new-entry',
                    data: {
                        ...log,
                        id: _response.data.objectId
                    }
                });

                handleClearLog();
            }).catch(error => handleError(error));
        }
    }

    const handleError = (error) => {
        if (error != null)
            return;

        const errors = error.split(', ');
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

    const handleClearLog = () => {
        dispatch(updateLog({
            id: '',
            date: new Date(Date.now()).toISOString(),
            starttime: '',
            endtime: '',
            description: '',
            notes: '',
            tags: []
        }));
    }

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

        dispatch(updateLog({ [_name]: value }));
    };

    useEffect(() => {
        window.electron.getStoreValue('serverIp').then(value => {
            setServerIp(value);
        });
        window.electron.getStoreValue('uniqueId').then(value => {
            setUniqueId(value);
            console.log(value);
        });
    }, []);

    const handleServerIpStorage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        window.electron.setStoreValue('serverIp', serverIpForm).then(() => {
            setServerIp(serverIpForm);
        });
        const hash = simple_hash();
        window.electron.setStoreValue('uniqueId', hash).then(() => {
            setUniqueId(hash);
        });
    }

    const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>, placeholder?: string) => {
        const { value } = e.target;
        setServerIpForm(value);
    };

    if (!serverIp) {
        return (
            <form onSubmit={handleServerIpStorage} className='flex justify-center flex-col h-96'>
                <Input value={serverIpForm} setValueOnChange={handleIpChange} title="Server Ip" placeholder="127.0.0.1:8081" />
                <div className="relative flex justify-center items-center mt-2">
                    <button className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-7 text-xs rounded-md" type="submit">
                        Save
                    </button>
                </div>
            </form>
        );
    } else {
        return (
            <>
                <form onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
                    <div className="relative mt-5">
                        <DatePicker
                            setDates={handleDate}
                            title="Date"
                            value={formatDate(new Date(log.date))}
                            placeholder={formatDate(new Date(Date.now()))}
                            startAndEndDate={false} />
                    </div>

                    <div className="flex justify-items-stretch space-x-2">
                        <Input value={log.starttime} setValueOnDoubleClick={handleChange} setValueOnChange={hanldeTimeChange} title="Start Time" placeholder={placeholder}
                            error={response.find(e => e.element == 'start_time')?.error} />
                        <Input value={log.endtime} setValueOnDoubleClick={handleChange} setValueOnChange={hanldeTimeChange} title="End Time" placeholder={placeholder} error={response.find(e => e.element == 'end_time')?.error} />
                    </div>

                    <Input value={log.description} setValueOnChange={handleChange} title="Description" placeholder="Description" error={response.find(e => e.element == 'description')?.error} />
                    <TextArea value={log.notes} setValueOnChange={handleChange} setValueOnEnter={handleEnterPress} title="Notes" placeholder="Notes" error={response.find(e => e.element == 'notes')?.error} />

                    <div className="relative mt-5">
                        <TagSelector
                            selectedTags={log.tags}
                            setSelectedTags={handleTags}
                            error={response.find(e => e.element == 'tags')?.error}
                        />
                    </div>

                    {response.length != 0 &&
                        <div className={`mt-2 text-xs text-center ${response.length != 0 ? 'text-red-500' : 'text-gray-400'} `}>
                            Entry was not inserted
                        </div>
                    }
                    <div className="relative flex justify-center items-center mt-2 gap-x-2">
                        {log.id != '' ?
                            <>
                                <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-7 text-xs rounded-md" onClick={e => handleClear(e)}>
                                    Cancel
                                </button>
                                <button className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-7 text-xs rounded-md" type="submit">
                                    Update
                                </button>
                            </>
                            :
                            <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-7 text-xs rounded-md" type="submit">
                                Submit
                            </button>
                        }
                    </div>
                </form>
                <div className="mt-3 text-xs flex justify-center gap-x-2 text-gray-500">
                    <span className="cursor-pointer hover:underline select-none" onClick={() => { window.electron.openEntriesWindow(); }}>Entries</span>
                    /
                    <span className="cursor-pointer hover:underline select-none" onClick={() => { window.electron.openTagsWindow(); }}>Tags</span>
                </div>
            </>
        );

    }
}