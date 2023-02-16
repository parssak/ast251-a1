const fs = require("fs");
const csv = require("csv-parse");
const plot = require("nodeplotlib");

// Read in the CSV file
const data1 = fs.readFileSync("./kyanzad2_c1.csv");

const handlePlot = (title, data) => {
  csv.parse(data, { columns: true }, (err, output) => {
    if (err) {
      console.error(err);
      return;
    }

    const x = output.map((row) => row["Time (Days) "]);
    const y = output.map((row) => row["Brightness (solar luminosities) "]);
    const errBar = output.map((row) => row["Brightness uncertainty (solar luminosities) "]);

    plot.plot(
      [
        {
          x,
          y,
          error_x: {
            type: "data",
            array: errBar,
            visible: true
          },
          type: "line",
          name: "Kyanzad 2"
        }
      ],
      {
        title,
        xaxis: {
          title: "Time (Days)"
        },
        yaxis: {
          title: "Brightness (solar luminosities)"
        }
      }
    );
  });
};

const getDips = (data) => {
  csv.parse(data, { columns: true }, (err, output) => {
    if (err) {
      console.error(err);
      return;
    }

    const x = output.map((row) => row["Time (Days) "]);
    const y = output.map((row) => row["Brightness (solar luminosities) "]);
    const errBar = output.map((row) => row["Brightness uncertainty (solar luminosities) "]);

    const sortedByBrightness = output.sort(
      (a, b) => a["Brightness (solar luminosities) "] - b["Brightness (solar luminosities) "]
    );
    const sortedByDay = x.sort((a, b) => a - b);
    const dayRange = sortedByDay[sortedByDay.length - 1] - sortedByDay[0];

    const take = 100;

    const grouped = Object.values(
      Object.fromEntries(
        sortedByBrightness.slice(0, take).map((row) => {
          return [
            Math.floor(10 * Number(row["Time (Days) "] / dayRange)),
            {
              t: Number(row["Time (Days) "]),
              brightness: Number(row["Brightness (solar luminosities) "])
            }
          ];
        })
      )
    );

    console.debug("=== DIPS ===");
    console.debug(grouped);

    console.debug();
    console.debug();
    console.debug("=== DIFFERENCE IN DIPS ===");
    const diffs = grouped
      .map((row, i) => {
        if (i === 0) {
          return 0;
        }

        return row.t - grouped[i - 1].t;
      })
      .filter(Boolean);
    console.debug(diffs);

    console.debug();
    console.debug();
    console.debug("=== DEPTH OF DIPS ===");

    const avgDepth =
      grouped.reduce((acc, row, i) => {
        if (i === 0) {
          return 0;
        }

        return acc + (row.brightness - grouped[i - 1].brightness);
      }, 0) / grouped.length;

    const depths = grouped.map((row, i) => {
      if (i === 0) {
        return 0;
      }

      return row.brightness - avgDepth;
    }).filter(Boolean)

    console.debug(depths);
  });
};

handlePlot("C1", data1);
getDips(data1);
