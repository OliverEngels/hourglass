import TagElement from "@components/tag.client";
import DatePicker from "@components/datepicker.client";
import TagSelector from "@components/tag-selector.client";
import { Input } from "@components/form-elements.client";
import { formatDate } from "@components/helpers/datetime.format";
import { useEffect, useRef, useState } from "react";
import { HttpRequestPromise } from "@components/http-request";
import { exportTableToCSV } from "@components/helpers/csv.export";
import { calculateTotalTime, formatMinutesToHours, getTimeDifference } from "@components/helpers/time.format";
import React from "react";
import { Tag, createTags, deleteTag, updateTag } from "@redux/reducers/tags";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { useDispatch } from "@redux/hooks";
import { createEntries, createEntry, deleteEntry } from "@redux/reducers/entries";

type FormData = {
    startDate: Date;
    endDate: Date;
    tags: Tag[];
    search: string;
};

const Entries = () => {
    const tableRef = useRef(null);
    const tags = useSelector((state: RootState) => state.tagState.tags);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const entries = useSelector((state: RootState) => state.entryState.entries);
    const dispatch = useDispatch();

    const now = new Date(Date.now());
    const [formData, setFormData] = useState<FormData>(
        {
            startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0),
            endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
            tags: [],
            search: ''
        });

    useEffect(() => {
        const handleDataUpdate = (response: any) => {
            if (response.update == "tag") {
                dispatch(updateTag({ id: response.data.id, updatedTagData: response.data }));
            }
            if (response.update == 'delete-tag') {
                response.data.map(tagValue => {
                    const tag = tags.find(t => t.value == tagValue);
                    dispatch(deleteTag({ id: tag.id }));
                });
                const array2Ids = new Set(response.data.map(obj => obj));
                const result = formData.tags.filter(obj => !array2Ids.has(obj.value));
                setFormData(prev => ({
                    ...prev,
                    tags: result
                }));
            }
            if (response.update == "new-entry") {
                const entryDate = new Date(response.data.date);
                if (new Date(response.data.date) > formData.startDate &&
                    new Date(response.data.date) < formData.endDate) {
                    dispatch(createEntry(response.data));
                }
            }
        };

        const cleanupListener = window.electron.onDataUpdate(handleDataUpdate);

        return () => {
            if (typeof cleanupListener === 'function') {
                //@ts-ignore
                cleanupListener();
            }
        };
    }, [formData, tags]);

    useEffect(() => {
        HttpRequestPromise('/api/tags')
            .then(_response => {
                dispatch(createTags(_response.data));
                updateEntries();
            });
    }, []);

    useEffect(() => {
        HttpRequestPromise('/api/entries', {
            method: 'POST',
            body: JSON.stringify({
            })
        }).then(_response => {
            dispatch(createEntries(_response.data));
            setIsLoading(false);
            setSelectedRows([]);
        });
    }, []);

    useEffect(() => {
        updateEntries();
    }, [formData.endDate, formData.startDate, formData.tags]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, placeholder?: string) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name.toLocaleLowerCase()]: placeholder ? placeholder : value }));
    };

    const handleDate = (date: { startDate: Date, endDate: Date }) => {
        const _startDate = new Date(date.startDate.getFullYear(), date.startDate.getMonth(), date.startDate.getDate(), 1, 0, 0);
        const _endDate = new Date(date.endDate.getFullYear(), date.endDate.getMonth(), date.endDate.getDate(), 23, 59, 59);
        setFormData(prev => ({
            ...prev,
            startDate: _startDate, endDate: _endDate
        }));
    }

    const updateEntries = () => {
        setIsLoading(true);
        HttpRequestPromise('/api/entries', {
            method: 'POST',
            body: JSON.stringify(formData)
        }).then(_response => {
            dispatch(createEntries(_response.data));
            setIsLoading(false);
        }).catch(_error => {
            console.log(_error)
        });
    }

    const handleTags = (newTags: Tag[] | ((tags: Tag[]) => Tag[])) => {
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

    const handleSelectRow = (id: string) => {
        if (selectedRows.includes(id)) {
            const remainingTags = selectedRows.filter(e => e != id);
            setSelectedRows(remainingTags);
        } else {
            setSelectedRows(prev => [...prev, id]);
        }
    };

    const handleDeleteSelectedRow = () => {
        HttpRequestPromise('/api/entries', {
            method: 'DELETE',
            body: JSON.stringify({ ids: selectedRows })
        }).then(e => {
            selectedRows.map(e => {
                dispatch(deleteEntry({ id: e }));
            })
            setSelectedRows([]);
        }).catch(e => {
            console.log(e);
        });
    }

    return (
        <>
            <div className="container mx-auto mt-4 mb-10">
                <div className="flex w-full mb-3 justify-start space-x-3">
                    <div className="mt-5 relative flex flex-col items-center">
                        <button className={`${selectedRows.length > 0 ? 'bg-red-400 hover:bg-red-500' : 'bg-gray-400 pointer-events-none'} peer px-3 py-2.5 text-white rounded`} onClick={handleDeleteSelectedRow}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="white">
                                <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                            </svg>
                        </button>
                        <div className="peer-hover:flex absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-700 rounded-md text-nowrap opacity-0 transition-opacity duration-200 peer-hover:opacity-100">
                            delete
                        </div>
                    </div>
                    <DatePicker setDates={handleDate} title="Date" placeholder={formatDate(new Date(Date.now()))} />
                    <TagSelector setSelectedTags={handleTags} selectedTags={formData.tags} />
                    <Input value={formData.search} setValueOnChange={handleChange} setValueOnEnter={updateEntries} title="Search" placeholder="Example: C#" />
                    <div className="mt-5 relative flex flex-col items-center">
                        <button className="bg-teal-500 hover:bg-teal-600 peer px-3 py-2.5 text-white rounded" onClick={updateEntries}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="white">
                                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                            </svg>
                        </button>
                        <div className="peer-hover:flex absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-700 rounded-md text-nowrap opacity-0 transition-opacity duration-200 peer-hover:opacity-100">
                            search
                        </div>
                    </div>
                    <div className="mt-5 relative flex flex-col items-center">
                        <button className="peer px-3 py-2.5 text-white bg-indigo-500 rounded hover:bg-indigo-600" onClick={() => exportTableToCSV(tableRef, { startDate: formData.startDate, endDate: formData.endDate })}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20" fill="white">
                                <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
                            </svg>
                        </button>
                        <div className="peer-hover:flex absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-700 rounded-md text-nowrap opacity-0 transition-opacity duration-200 peer-hover:opacity-100">
                            download .csv
                        </div>
                    </div>
                </div>
                <table className="min-w-full table-auto rounded overflow-hidden" ref={tableRef}>
                    <thead className="bg-indigo-600 text-white text-base h-12 leading-8 border-b-[1px] border-indigo-700">
                        <tr>
                            <th className="px-4 py-2 font-light text-start"></th>
                            <th className="px-4 py-2 font-light text-start">Date</th>
                            <th className="px-4 py-2 font-light text-start">Description</th>
                            <th className="px-4 py-2 font-light text-center hidden lg:table-cell">Start</th>
                            <th className="px-4 py-2 font-light text-center hidden lg:table-cell">End</th>
                            <th className="px-4 py-2 font-light text-center">Duration</th>
                            <th className="px-4 py-2 font-light text-start hidden lg:table-cell">Notes</th>
                            <th className="px-4 py-2 font-light text-start hidden sm:table-cell">Tags</th>
                        </tr>
                    </thead>
                    <tbody className="scrollable-tbody max-h-full w-full">
                        {isLoading ?
                            <tr>
                                <td colSpan={8} className="bg-gray-100 text-gray-500 text-sm border-t h-full w-full align-middle p-5">
                                    <div className="flex justify-center items-center h-full">
                                        <div className="w-8 h-8 border-4 border-t-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </td>
                            </tr>
                            :
                            entries.map((e, i) => (
                                <tr className="bg-gray-100 text-gray-500 text-sm border-t hover:bg-gray-50 cursor-pointer h-full" id={e.id} key={`row-${i}`}>
                                    <td className="text-center">
                                        <label className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                className="checkbox-hidden"
                                                checked={selectedRows.includes(e.id)}
                                                onChange={() => handleSelectRow(e.id)}
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                    </td>
                                    <td className="px-4 py-2 w-[115px] text-start">{e.date.split("T")[0]}</td>
                                    <td className="px-4 py-2 text-start">{e.description}</td>
                                    <td className="px-4 py-2 text-center hidden lg:table-cell">{e.starttime}</td>
                                    <td className="px-4 py-2 text-center hidden lg:table-cell">{e.endtime}</td>
                                    <td className="px-4 py-2 text-center">{formatMinutesToHours(getTimeDifference(e.starttime, e.endtime))}</td>
                                    <td className="px-4 py-2 text-start hidden lg:table-cell">
                                        {e.notes.split('\n').map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}
                                    </td>
                                    <td className="px-4 py-2 hidden sm:table-cell align-middle">
                                        <div className="flex justify-end">
                                            {e.tags.map((b, j) => {
                                                const tag = tags.find(t => t.value == b.value);
                                                if (tag)
                                                    return <TagElement
                                                        text={tag.value}
                                                        color={tag.color}
                                                        key={`badge-${tag.id}-${j}`} />
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 text-gray-500 text-sm border-t font-bold ">
                            <th className="px-4 py-2 font-light text-start"></th>
                            <td className="px-4 py-2 w-[115px] text-start"></td>
                            <td className="px-4 py-2 text-start hidden lg:table-cell"></td>
                            <td className="px-4 py-2 text-end hidden lg:table-cell"></td>
                            <td className="px-4 py-2 text-end">Total: </td>
                            <td className="px-4 py-2 text-center">{!isLoading && calculateTotalTime(entries !== undefined ? entries : [])}</td>
                            <td className="px-4 py-2 text-start hidden lg:table-cell"></td>
                            <td className="px-4 py-2  hidden sm:flex"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    )
}

export default Entries;