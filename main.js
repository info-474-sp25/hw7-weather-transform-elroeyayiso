// SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG container and group element for the chart
const svgLine = d3.select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// LOAD AND TRANSFORM DATA
d3.csv("weather.csv").then(data => {
    // --- CASE 1: FLATTEN ---
    data.forEach(d => {
        d.city = d.city;
        d.date = d.date;
        d.year = new Date(d.date);
        d.precip = +d.average_precipitation;
    });

    console.log("Raw data (after transform):", data.slice(0, 5));

    const filteredData1 = data;

    const groupedData1 = d3.groups(filteredData1,
        d => d.city,
        d => d.year.getFullYear()
    ).map(([city, yearGroups]) => ({
        city,
        values: yearGroups.map(([year, entries]) => ({
            year,
            aggNum: d3.mean(entries, e => e.precip)
        }))
    }));

    console.log("Grouped data 1:", groupedData1);

    // FLATTEN CASE 1
    const flattenedData = groupedData1.flatMap(({ city, values }) =>
        values.map(({ year, aggNum }) => ({
            year,
            avgPrecip: aggNum,
            city
        }))
    );

    console.log("Final flattened data:", flattenedData);
    console.log("---------------------------------------------------------------------");

    // --- CASE 2: PIVOT ---
    data.forEach(d => {
        d.year = new Date(d.date).getFullYear();
        d.month = new Date(d.date).getMonth() + 1;
        d.actualPrecip = +d.actual_precipitation;
        d.avgPrecip = +d.average_precipitation;
        d.recordPrecip = +d.record_precipitation;
    });

    console.log("=== CASE 2: PIVOT ===");
    console.log("Raw data:", data.slice(0, 5));

    // FILTER FOR YEAR 2014
    const filteredData2 = data.filter(d => d.year === 2014);
    console.log("Filtered data 2:", filteredData2.slice(0, 5));

    // GROUP AND AGGREGATE BY MONTH
    const groupedData2 = d3.groups(filteredData2, d => d.month)
        .map(([month, entries]) => ({
            month,
            avgActualPrecip: d3.mean(entries, e => e.actualPrecip),
            avgAvgPrecip: d3.mean(entries, e => e.avgPrecip),
            avgRecordPrecip: d3.mean(entries, e => e.recordPrecip)
        }));

    console.log("Grouped data 2:", groupedData2);

    // FLATTEN TO LONG FORMAT
    const pivotedData = groupedData2.flatMap(d => [
        { month: d.month, value: d.avgActualPrecip, type: "Actual" },
        { month: d.month, value: d.avgAvgPrecip, type: "Average" },
        { month: d.month, value: d.avgRecordPrecip, type: "Record" }
    ]);

    console.log("Final pivoted data:", pivotedData);
});
