import Badge from "@components/tag.client";
import DatePicker from "@components/datepicker.client";
import TagSelector from "@components/tag-selector.client";
import { Input } from "@components/form-elements.client";
import { formatDate } from "@components/helpers/datetime.format";
import { useEffect, useState } from "react";
import { TagData } from "../components/schemes/api-tag";
import { HttpRequest, HttpRequestPromise } from "@components/http-request";

const Tags = () => {
    const [html, setHtml] = useState(<></>);
    const [search, setSearch] = useState("");
    const [oldId, setOldId] = useState<string>(null);
    // const [colors, setColors] = useState([

    // ]);

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

    const handleColorChange = (colorValue: string) => {
        console.log(`Selected color: ${colorValue}`);

        const color = document.getElementById(`color-${oldId}`);
    };

    useEffect(() => {
        setHtml(
            <div className="container mx-auto mt-10 mb-10">
                <div className="flex w-full mb-3 justify-start space-x-3">
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
                    <table className="min-w-full table-auto rounded overflow-hidden">
                        <thead className="bg-indigo-600 text-white text-base h-12 leading-8 border-b-[1px] border-indigo-700">
                            <tr>
                                <th className="px-4 py-2 font-light text-start">Tag</th>
                                <th className="px-4 py-2 font-light text-start">Type</th>
                                <th className="px-4 py-2 font-light text-center">Color</th>
                            </tr>
                        </thead>
                        <tbody className="scrollable-tbody max-h-full w-full">
                            {responseDate.map((e, i) => (
                                <tr className="bg-gray-100 text-gray-500 text-sm border-t" id={e.id} key={`row-${i}`}>
                                    <td className="px-4 py-2 text-start flex justify-start">
                                        <Badge color={e.color} text={e.value} />
                                    </td>

                                    <td className="px-4 py-2 text-start">{e.subtype}</td>
                                    <td className="px-4 py-2 text-start relative flex flex-col items-center">
                                        <div
                                            className={`flex justify-center items-center w-5 h-5 rounded cursor-pointer m-1 bg-${e.color}-400`}
                                            id={`color-${e.id}`}
                                            onClick={() => handleColorPopup(e.id)}
                                        />
                                        <div
                                            className="flex justify-start flex-wrap absolute bg-white rounded opacity-0 transition-opacity duration-200 bottom-full pointer-events-none p-1 shadow w-[64px] sm:w-[92px] xl:w-[260px]"
                                            id={`select-${e.id}`}>
                                            {colors.map(c => {
                                                const color = c.toLocaleLowerCase();
                                                return <div
                                                    key={color}
                                                    className={`flex justify-center items-center w-5 h-5 rounded cursor-pointer m-1 bg-${color}-400 hover:bg-${color}-500`}
                                                    onClick={() => handleColorChange(color)}
                                                />
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div >
        )
    }, [isLoading, responseDate, oldId]);

    return html;
}

export default Tags;