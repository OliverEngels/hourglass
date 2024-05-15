import Badge from "@components/tag.client";
import DatePicker from "@components/datepicker.client";
import TagSelector from "@components/tag-selector.client";
import { Input } from "@components/form-elements.client";
import { formatDate } from "@components/helpers/datetime.format";
import { useEffect, useRef, useState } from "react";
import { TagData } from "../components/schemes/api-tag";
import { HttpRequest, HttpRequestPromise } from "@components/http-request";
import { exportTableToCSV } from "@components/helpers/csv.export";
import { calculateTotalTime, formatMinutesToHours, getTimeDifference } from "@components/helpers/time.format";
import React from "react";

type FormData = {
    startDate: Date;
    endDate: Date;
    tags: TagData[];
    search: string;
};

const Entries = () => {
    const [html, setHtml] = useState(<></>);
    const tableRef = useRef(null);

    const [formData, setFormData] = useState<FormData>(
        { startDate: new Date(Date.now()), endDate: new Date(Date.now()), tags: [], search: '' });

    const { response, isLoading } = HttpRequest('/api/entries', {
        method: 'POST',
        body: JSON.stringify({
            startDate: new Date(formData.startDate.getFullYear(), formData.startDate.getMonth(), formData.startDate.getDate(), 1, 0, 0),
            endDate: new Date(formData.endDate.getFullYear(), formData.endDate.getMonth(), formData.endDate.getDate(), 23, 59, 59)
        })
    });

    const [responseDate, setResponseData] = useState([]);

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
        HttpRequestPromise('/api/entries', {
            method: 'POST',
            body: JSON.stringify(formData)
        }).then((responseJson) => {
            setResponseData(responseJson.data);
        }).catch(_error => {
            console.log(_error)
        });
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

    useEffect(() => {
        if (response)
            setResponseData(response.data);
    }, [response]);

    useEffect(() => {
        updateEntries();
    }, [formData.endDate, formData.startDate, formData.tags]);

    useEffect(() => {
        setHtml(
            <div className="container mx-auto mt-10 mb-10">
                <div className="flex w-full mb-3 justify-start space-x-3">
                    <DatePicker setDates={handleDate} title="Date" placeholder={formatDate(new Date(Date.now()))} />
                    <TagSelector setselectedTags={handleTags} selectedTags={formData.tags} />
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
                {isLoading ? <p>Loading</p> :
                    <table className="min-w-full table-auto rounded overflow-hidden" ref={tableRef}>
                        <thead className="bg-indigo-600 text-white text-base h-12 leading-8 border-b-[1px] border-indigo-700">
                            <tr>
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
                            {responseDate.map((e, i) => (
                                <tr className="bg-gray-100 text-gray-500 text-sm border-t" id={e.id} key={`row-${i}`}>
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
                                    <td className="px-4 py-2 hidden sm:flex items-center">
                                        {e.tags.map((b, j) => (
                                            <Badge text={b.value} color={b.color} key={`badge-${e._id}-${j}`} />
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 text-gray-500 text-sm border-t font-bold">
                                <td className="px-4 py-2 w-[115px] text-start"></td>
                                <td className="px-4 py-2 text-start hidden lg:table-cell"></td>
                                <td className="px-4 py-2 text-end hidden lg:table-cell"></td>
                                <td className="px-4 py-2 text-end">Total: </td>
                                <td className="px-4 py-2 text-center">{!isLoading && calculateTotalTime(responseDate !== undefined ? responseDate : [])}</td>
                                <td className="px-4 py-2 text-start hidden lg:table-cell"></td>
                                <td className="px-4 py-2  hidden sm:flex"></td>
                            </tr>
                        </tfoot>
                    </table>
                }
            </div>
        )
    }, [isLoading, responseDate, formData]);

    return html;
}

export default Entries;