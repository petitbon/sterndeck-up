const fs = require("fs");
const Papa = require("papaparse");

function mergeColumnsByHeaders(csvData, header1, header2, newHeader) {
  return csvData.map((row) => {
    const newRow = { ...row };
    newRow[newHeader] = `${row[header1]} ${row[header2]}`;
    delete newRow[header1];
    delete newRow[header2];
    return newRow;
  });
}

function processCSV(filePath, header1, header2, newHeader) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the CSV file:", err);
      return;
    }

    Papa.parse(data, {
      header: true,
      complete: (results) => {
        const mergedData = mergeColumnsByHeaders(
          results.data,
          header1,
          header2,
          newHeader
        );
        const newCSV = Papa.unparse(mergedData);
        fs.writeFile("merged_output.csv", newCSV, "utf8", (err) => {
          if (err) {
            console.error("Error writing the new CSV file:", err);
            return;
          }
          console.log("Merged data has been written to merged_output.csv");
        });
      },
      error: (err) => {
        console.error("Error parsing the CSV file:", err);
      },
    });
  });
}

// Sample usage
/*
const filePath = "input.csv";
const header1 = "prompt";
const header2 = "completion";
const newHeader = "merged";

processCSV(filePath, header1, header2, newHeader);
*/
