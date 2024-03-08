function calculate() {
  var numberOfCrashes = parseFloat(document.getElementById("crashes").value);
  var numberOfInjuries = parseFloat(document.getElementById("injuries").value);
  var numberOfFatalities = parseFloat(
    document.getElementById("fatalities").value
  );

  const rates = [numberOfFatalities, numberOfInjuries, numberOfCrashes];
  const labels = ["Fatalities", "Injuries", "Crashes"];

  var unit = document.getElementById("unit").value;
  var confidenceInterval = parseFloat(
    document.getElementById("confidence").value
  );
  const confidenceIntervals = [0.5, 0.75, 0.95, 0.99];
  const precisionLevels = [0.05, 0.1, 0.2];

  // Add confidence interval if it's not within the pre-defined ones
  if (confidenceInterval && !confidenceIntervals.includes(confidenceInterval)) {
    confidenceIntervals.push(confidenceInterval);
  }
  confidenceIntervals.sort();

  var precision = parseFloat(document.getElementById("precision").value);

  if (precision && !precisionLevels.includes(precision)) {
    precisionLevels.push(precision);
  }
  precisionLevels.sort();

  var improvement = parseFloat(document.getElementById("improvement").value);
  const improvementRates = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function formatNumber(num) {
    if (Math.abs(num) >= 1e9) {
      return (num / 1e9).toFixed(1) + "B";
    } else if (Math.abs(num) >= 1e6) {
      return (num / 1e6).toFixed(1) + "M";
    } else {
      return num.toLocaleString();
    }
  }

  // distance autonomous vehicles have to drive without failure to demonstrate that their failure rate is below some benchmark
  const distanceCrashesBenchmark = Math.ceil(
    Math.log(1 - confidenceInterval) / Math.log(1 - numberOfCrashes)
  );
  const distanceInjuriesBenchmark = Math.ceil(
    Math.log(1 - confidenceInterval) / Math.log(1 - numberOfInjuries)
  );
  const distanceFatalitiesBenchmark = Math.ceil(
    Math.log(1 - confidenceInterval) / Math.log(1 - numberOfFatalities)
  );

  const datasetsBenchmark = [];
  confidenceIntervals.forEach((interval) => {
    const calculatedDistances = [];
    rates.forEach((r) => {
      const distance = Math.ceil(Math.log(1 - interval) / Math.log(1 - r));
      calculatedDistances.push({ x: r, y: distance });
    });
    const color = getRandomColor();
    const dataset = {
      label: "C = " + (interval * 100).toString() + " %",
      data: calculatedDistances,
      fill: false,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 2,
      pointRadius: 5,
      pointBackgroundColor: "#fff",
    };
    datasetsBenchmark.push(dataset);
  });

  var resultsBenchmark = document.getElementById("resultsBenchmark");
  resultsBenchmark.innerHTML = `How many ${unit} would autonomous vehicles have to be driven without failure to demonstrate with ${(
    confidenceInterval * 100
  ).toString()} % confidence that their failure rate is at most`;

  var results = "<ul>";
  results += `<li>${numberOfCrashes} crashes per ${unit}: ${formatNumber(
    distanceCrashesBenchmark
  )} ${unit}</li>`;
  results += `<li>${numberOfInjuries} injuries per ${unit}: ${formatNumber(
    distanceInjuriesBenchmark
  )} ${unit}</li>`;
  results += `<li>${numberOfFatalities} fatalities per ${unit}: ${formatNumber(
    distanceFatalitiesBenchmark
  )} ${unit}</li>`;
  results += "</ul>";
  resultsBenchmark.innerHTML += results;

  var ctx = document.getElementById("chartContainerBenchmark");
  var chartBenchmark = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasetsBenchmark,
    },
    options: {
      scales: {
        xAxes: [
          {
            type: "logarithmic",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Failure rate",
            },
          },
        ],
        yAxes: [
          {
            type: "logarithmic",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Distance needed to be driven",
            },
          },
        ],
      },
    },
  });

  // distance autonomous vehicles have to be driven to demonstrate their failure rate to a particular degree of precision
  const zScore = jStat.normal.inv(1 - (1 - confidenceInterval) / 2, 0, 1); // half-width of CI
  const distanceCrashesPrecision = Math.ceil(
    Math.pow(zScore / precision, 2) / numberOfCrashes
  );
  const distanceInjuriesPrecision = Math.ceil(
    Math.pow(zScore / precision, 2) / numberOfInjuries
  );
  const distanceFatalitiesPrecision = Math.ceil(
    Math.pow(zScore / precision, 2) / numberOfFatalities
  );

  const datasetsPrecision = [];
  precisionLevels.forEach((precLvl) => {
    const calculatedDistances = [];
    rates.forEach((r) => {
      const distance = Math.ceil(Math.pow(zScore / precLvl, 2) / r);
      calculatedDistances.push({ x: r, y: distance });
    });
    const color = getRandomColor();
    const dataset = {
      label: "δ = " + (precLvl * 100).toString() + " %",
      data: calculatedDistances,
      fill: false,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 2,
      pointRadius: 5,
      pointBackgroundColor: "#fff",
    };
    datasetsPrecision.push(dataset);
  });

  var resultsPrecision = document.getElementById("resultsPrecision");
  resultsPrecision.innerHTML = `How many ${unit} would autonomous vehicles have to be driven to demonstrate with ${(
    confidenceInterval * 100
  ).toString()} % confidence their failure rate is within ${(
    precision * 100
  ).toString()} % of the true rate of`;

  var results = "<ul>";
  results += `<li>${numberOfCrashes} crashes per ${unit}: ${formatNumber(
    distanceCrashesPrecision
  )} ${unit}</li>`;
  results += `<li>${numberOfInjuries} injuries per ${unit}: ${formatNumber(
    distanceInjuriesPrecision
  )} ${unit}</li>`;
  results += `<li>${numberOfFatalities} fatalities per ${unit}: ${formatNumber(
    distanceFatalitiesPrecision
  )} ${unit}</li>`;
  results += "</ul>";
  resultsPrecision.innerHTML += results;

  var ctxPrecision = document.getElementById("chartContainerPrecision");
  var chartPrecision = new Chart(ctxPrecision, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasetsPrecision,
    },
    options: {
      scales: {
        xAxes: [
          {
            type: "logarithmic",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Failure rate",
            },
          },
        ],
        yAxes: [
          {
            type: "logarithmic",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Distance needed to be driven",
            },
          },
        ],
      },
    },
  });

  // distance autonomous vehicles have to be driven to demonstrate their failure rate is statistically significantly lower than the human driver failure rate
  const zScoreFull = jStat.normal.inv(1 - (1 - confidenceInterval), 0, 1); // full width of CI

  const improvedCrashRate = (1 - improvement) * numberOfCrashes;
  const distanceCrashesImprovement = Math.ceil(
    improvedCrashRate *
      Math.pow(zScoreFull / (numberOfCrashes - improvedCrashRate), 2)
  );

  const improvedInjuryRate = (1 - improvement) * numberOfInjuries;
  const distanceInjuriesImprovement = Math.ceil(
    improvedInjuryRate *
      Math.pow(zScoreFull / (numberOfInjuries - improvedInjuryRate), 2)
  );

  const improvedFatalityRate = (1 - improvement) * numberOfFatalities;
  const distanceFatalitiesImprovement = Math.ceil(
    improvedFatalityRate *
      Math.pow(zScoreFull / (numberOfFatalities - improvedFatalityRate), 2)
  );

  const datasetsImprovement = [];
  rates.forEach((r, index) => {
    const calculatedDistances = [];
    improvementRates.forEach((improvementPercentage) => {
      const improvedRate = (1 - improvementPercentage) * r;
      const distance = Math.ceil(
        improvedRate * Math.pow(zScoreFull / (r - improvedRate), 2)
      );
      calculatedDistances.push({ x: improvementPercentage, y: distance });
    });
    const color = getRandomColor();
    const dataset = {
      data: calculatedDistances,
      label: labels[index],
      fill: false,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 2,
      pointRadius: 5,
      pointBackgroundColor: "#fff",
    };
    datasetsImprovement.push(dataset);
  });

  var resultsImprovement = document.getElementById("resultsImprovement");
  resultsImprovement.innerHTML = `How many ${unit} would autonomous vehicles have to be driven to demonstrate with ${(
    confidenceInterval * 100
  ).toString()} % confidence that their failure rate is ${(
    improvement * 100
  ).toString()} % better than the human driver failure rate of`;

  var results = "<ul>";
  results += `<li>${numberOfCrashes} crashes per ${unit}: ${formatNumber(
    distanceCrashesImprovement
  )} ${unit}</li>`;
  results += `<li>${numberOfInjuries} injuries per ${unit}: ${formatNumber(
    distanceInjuriesImprovement
  )} ${unit}</li>`;
  results += `<li>${numberOfFatalities} fatalities per ${unit}: ${formatNumber(
    distanceFatalitiesImprovement
  )} ${unit}</li>`;
  results += "</ul>";
  resultsImprovement.innerHTML += results;

  var ctxImprovement = document.getElementById("chartContainerImprovement");
  var chartImprovement = new Chart(ctxImprovement, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasetsImprovement,
    },
    options: {
      scales: {
        xAxes: [
          {
            type: "linear",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Percentage improvement over human drivers",
            },
          },
        ],
        yAxes: [
          {
            type: "logarithmic",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Distance needed to be driven",
            },
          },
        ],
      },
    },
  });
}
