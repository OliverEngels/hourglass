import Badge from "@components/tag.client";
import { Input } from "@components/form-elements.client";
import { useEffect, useState } from "react";
import { HttpRequest, HttpRequestPromise } from "@components/http-request";

const Tags = () => {
    const [html, setHtml] = useState(<></>);
    const [search, setSearch] = useState("");
    const [oldId, setOldId] = useState<string>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const { response, isLoading } = HttpRequest('/api/tags', {
        method: 'GET',
    });
    const [responseDate, setResponseData] = useState([]);

    useEffect(() => {
        if (response)
            setResponseData(response.data);
    }, [response]);

    const colors = ['Orange', 'Red', 'Green', 'Blue', 'Yellow', 'Pink', 'Gray', 'Purple', 'Lime'];

    const handleColorPopup = (id: string) => {
        const colorSelectDiv = document.getElementById(`select-${id}`);
        colorSelectDiv.style.opacity = "1";
        colorSelectDiv.style.pointerEvents = "auto";

        if (oldId != null) {
            const oldColorSelectDiv = document.getElementById(`select-${oldId}`);
            oldColorSelectDiv.style.opacity = "0";
            oldColorSelectDiv.style.pointerEvents = "none";
        }

        if (oldId == id)
            setOldId(null)
        else
            setOldId(id);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`#select-${oldId}`) && oldId != null) {
                const oldColorSelectDiv = document.getElementById(`select-${oldId}`);
                oldColorSelectDiv.style.opacity = "0";
                oldColorSelectDiv.style.pointerEvents = "none";
            }
        };

        window.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [oldId]);

    const handleColorChange = (colorValue: string, e) => {
        HttpRequestPromise(`/api/tag/${e.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                value: e.value,
                subtype: e.subtype,
                color: colorValue
            })
        }).then((e) => {
            //console.log(e)
            setResponseData(e.data);
        })
    };

    const handleSelectRow = (value: string) => {
        if (selectedRows.includes(value)) {
            const remainingTags = selectedRows.filter(tag => tag != value);
            setSelectedRows(remainingTags);
        } else {
            setSelectedRows(prev => [...prev, value]);
        }
    };

    const handleDeleteSelectedRow = () => {
        HttpRequestPromise('/api/tags', {
            method: 'DELETE',
            body: JSON.stringify({ tags: selectedRows })
        }).then(e => {
            const remainingTags = responseDate.filter(t => !selectedRows.includes(t.value));
            setResponseData(remainingTags);
            setSelectedRows([]);
        }).catch(e => {
            console.log(e);
        });
    }

    useEffect(() => {
        setHtml(
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
                    <Input value={search} setValueOnChange={setSearch} title="Search" placeholder="Example: C#" />
                    <div className="mt-5 relative flex flex-col items-center">
                        <button className="bg-teal-500 hover:bg-teal-600 peer px-3 py-2.5 text-white rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="white">
                                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                            </svg>
                        </button>
                        <div className="peer-hover:flex absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-700 rounded-md text-nowrap opacity-0 transition-opacity duration-200 peer-hover:opacity-100">
                            search
                        </div>
                    </div>
                </div>
                {isLoading ? <p>Loading</p> :
                    <table className="min-w-full table-auto rounded overflow-hidden z-0">
                        <thead className="bg-indigo-600 text-white text-base h-12 leading-8 border-b-[1px] border-indigo-700">
                            <tr>
                                <th className="px-4 py-2 font-light text-start"></th>
                                <th className="px-4 py-2 font-light text-start">Tag</th>
                                <th className="px-4 py-2 font-light text-start">Type</th>
                                <th className="px-4 py-2 font-light text-center">Color</th>
                            </tr>
                        </thead>
                        <tbody className="scrollable-tbody max-h-full w-full">
                            {responseDate.map((e, i) => (
                                <tr className="bg-gray-100 text-gray-500 text-sm border-t" id={e.id} key={`row-${i}`}>
                                    <td className="text-center">
                                        <label className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                className="checkbox-hidden"
                                                checked={selectedRows.includes(e.value)}
                                                onChange={() => handleSelectRow(e.value)}
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                    </td>
                                    <td className="px-4 py-2 text-start flex justify-start">
                                        <Badge color={e.color} text={e.value} />
                                    </td>

                                    <td className="px-4 py-2 text-start">{e.subtype}</td>
                                    <td className="px-4 py-2 text-start absolute flex flex-col items-center">
                                        <div className="w-full h-full flex justify-center items-center absolute">
                                            <div
                                                className={`flex justify-center items-center w-5 h-5 rounded cursor-pointer m-1 bg-${e.color}-400`}
                                                id={`color-${e.id}`}
                                                onClick={() => handleColorPopup(e.id)}
                                            />
                                            <div
                                                className="flex justify-start flex-wrap absolute bg-white rounded opacity-0 transition-opacity duration-200 bottom-full pointer-events-none p-1 shadow w-[64px] sm:w-[92px] xl:w-[260px] z-50"
                                                id={`select-${e.id}`}>
                                                {colors.map(c => {
                                                    const color = c.toLocaleLowerCase();
                                                    return <div
                                                        key={color}
                                                        className={`flex justify-center items-center w-5 h-5 rounded cursor-pointer m-1 bg-${color}-400 hover:bg-${color}-500`}
                                                        onClick={() => handleColorChange(color, e)}
                                                    />
                                                })}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div >
        )
    }, [isLoading, responseDate, oldId, selectedRows]);

    return html;
}

export default Tags;