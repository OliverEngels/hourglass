import { RefObject } from "react";
import { normalizeDate } from "./datetime.format";

export const exportTableToCSV = (tableRef: RefObject<HTMLElement>, dates: { startDate: Date, endDate: Date }) => {
    let csv = [];
    let rows = tableRef.current.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td, th");

        for (let j = 0; j < cols.length; j++) {
            let value = "";
            if (j > 0) {
                //@ts-ignore
                value = cols[j].innerText.replace('\n', ', ');
            }
            else {
                //@ts-ignore
                value = cols[j].innerText;
            }

            row.push(value);
        }

        csv.push(row.join(";"));
    }

    const startDate = normalizeDate(dates.startDate);
    const endDate = normalizeDate(dates.endDate);

    downloadCSV(csv.join("\n"), `hourglass_${startDate}_${endDate}.csv`);
}

const downloadCSV = (csv, filename) => {
    let csvFile = new Blob([csv], { type: "text/csv" });
    let downloadLink = document.createElement('a');

    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
}