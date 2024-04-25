const width = 960;
const height = 500;
const innerRadius = 100;
const outerRadius = Math.min(width, height) / 2;

// Append SVG object to the div called 'chart'
const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr(
    'transform',
    'translate(' + width / 2 + ',' + height / 2 + ')',
  );

// Load data from GitHub URL
d3.csv(
  'https://raw.githubusercontent.com/bharathkumar192/Tableau-GDP/master/world-data-2023.csv',
).then(function (data) {
  // Filter or parse data as needed
  data = data.map((d) => {
    return {
      Country: d.Country,
      GDP: +d.GDP.replace(/[^0-9.-]+/g, ''),
    }; // Strip non-numeric characters for safety
  });

  // Create a scale for the angles
  const x = d3
    .scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(data.map((d) => d.Country));

  // Create a scale for the radius
  const y = d3
    .scaleRadial()
    .range([innerRadius, outerRadius])
    .domain([0, d3.max(data, (d) => d.GDP)]);

  // Add bars
  svg
    .append('g')
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('fill', '#69b3a2')
    .attr(
      'd',
      d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius((d) => y(d.GDP))
        .startAngle((d) => x(d.Country))
        .endAngle((d) => x(d.Country) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius),
    );

  // Add labels
  svg
    .append('g')
    .selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr('text-anchor', function (d) {
      return (x(d.Country) + x.bandwidth() / 2 + Math.PI) %
        (2 * Math.PI) <
        Math.PI
        ? 'end'
        : 'start';
    })
    .attr('transform', function (d) {
      return (
        'rotate(' +
        (((x(d.Country) + x.bandwidth() / 2) * 180) /
          Math.PI -
          90) +
        ')' +
        'translate(' +
        (y(d.GDP) + 10) +
        ',0)'
      );
    })
    .append('text')
    .text((d) => d.Country)
    .attr('transform', function (d) {
      return (x(d.Country) + x.bandwidth() / 2 + Math.PI) %
        (2 * Math.PI) <
        Math.PI
        ? 'rotate(180)'
        : 'rotate(0)';
    })
    .style('font-size', '11px')
    .attr('alignment-baseline', 'middle');
});
const marginViolin = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 40,
  },
  widthViolin =
    450 - marginViolin.left - marginViolin.right,
  heightViolin =
    400 - marginViolin.top - marginViolin.bottom;

// Append SVG object to the div called 'violin'
const svgViolin = d3
  .select('#violin')
  .append('svg')
  .attr(
    'width',
    widthViolin + marginViolin.left + marginViolin.right,
  )
  .attr(
    'height',
    heightViolin + marginViolin.top + marginViolin.bottom,
  )
  .append('g')
  .attr(
    'transform',
    'translate(' +
      marginViolin.left +
      ',' +
      marginViolin.top +
      ')',
  );

// Read the data and compute summary statistics for each specie
d3.csv(
  'https://raw.githubusercontent.com/bharathkumar192/Tableau-GDP/master/world-data-2023.csv',
).then(function (data) {
  // Build and Show the Y scale
  var y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return +d.GDP.replace(/[^0-9.-]+/g, '');
      }),
    ])
    .range([heightViolin, 0]);
  svgViolin.append('g').call(d3.axisLeft(y));

  // Features of the histogram
  var histogram = d3
    .histogram()
    .domain(y.domain())
    .thresholds(y.ticks(20)) // the number of bins
    .value((d) => d);

  // Compute the binning for each group of the dataset
  var sumstat = Array.from(
    d3.rollup(
      data,
      (v) => {
        const input = v.map(
          (d) => +d.GDP.replace(/[^0-9.-]+/g, ''),
        );
        const bins = histogram(input);
        return bins;
      },
      (d) => d.Country,
    ),
  );

  // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
  var maxNum = 0;
  for (const [key, value] of sumstat) {
    let lengths = value.map((d) => d.length);
    let longest = d3.max(lengths);
    if (longest > maxNum) {
      maxNum = longest;
    }
  }

  // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
  var xNum = d3
    .scaleLinear()
    .range([0, 50])
    .domain([-maxNum, maxNum]);

  // Add the shapes to this svg!
  svgViolin
    .selectAll('myViolin')
    .data(sumstat)
    .enter() // So now we are working group per group
    .append('g')
    .attr('transform', function (d) {
      return 'translate(' + 50 + ' ,0)';
    }) // Translation on the right to be at the group position
    .append('path')
    .datum(function (d) {
      return d[1];
    }) // So now we are working bin per bin
    .style('stroke', 'none')
    .style('fill', '#69b3a2')
    .attr(
      'd',
      d3
        .area()
        .x0(function (d) {
          return xNum(-d.length);
        })
        .x1(function (d) {
          return xNum(d.length);
        })
        .y(function (d) {
          return y(d.x0);
        })
        .curve(d3.curveCatmullRom), // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
    );
});
// Set the dimensions and margins of the graph
const marginBubble = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50,
  },
  widthBubble =
    940 - marginBubble.left - marginBubble.right,
  heightBubble =
    500 - marginBubble.top - marginBubble.bottom;

// Append SVG object to the div called 'bubble'
const svgBubble = d3
  .select('#bubble')
  .append('svg')
  .attr(
    'width',
    widthBubble + marginBubble.left + marginBubble.right,
  )
  .attr(
    'height',
    heightBubble + marginBubble.top + marginBubble.bottom,
  )
  .append('g')
  .attr(
    'transform',
    'translate(' +
      marginBubble.left +
      ',' +
      marginBubble.top +
      ')',
  );

// Read data
d3.csv(
  'https://raw.githubusercontent.com/bharathkumar192/Tableau-GDP/master/world-data-2023.csv',
).then(function (data) {
  // Filter data
  data = data.map((d) => {
    return {
      Country: d.Country,
      Population: +d.Population.replace(/[^0-9.-]+/g, ''),
      GDP: +d.GDP.replace(/[^0-9.-]+/g, ''),
      Co2Emissions: +d['Co2-Emissions'].replace(
        /[^0-9.-]+/g,
        '',
      ),
    };
  });

  // Add X axis
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.GDP)])
    .range([0, widthBubble]);
  svgBubble
    .append('g')
    .attr('transform', 'translate(0,' + heightBubble + ')')
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Population)])
    .range([heightBubble, 0]);
  svgBubble.append('g').call(d3.axisLeft(y));

  // Add a scale for bubble size
  const z = d3
    .scaleSqrt()
    .domain([0, d3.max(data, (d) => d.Co2Emissions)])
    .range([2, 30]);

  // Add a scale for bubble color
  const myColor = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.Country))
    .range(d3.schemeSet3);

  // Tooltip
  const tooltip = d3
    .select('#bubble')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px');

  // Mouse event functions
  const mouseover = function (event, d) {
    tooltip.style('opacity', 1);
  };
  const mousemove = function (event, d) {
    tooltip
      .html(
        'Country: ' +
          d.Country +
          '<br>GDP: ' +
          d.GDP +
          ' USD<br>Population: ' +
          d.Population +
          '<br>CO2 Emissions: ' +
          d.Co2Emissions +
          ' kT',
      )
      .style('left', event.x / 2 + 'px')
      .style('top', event.y / 2 - 30 + 'px');
  };
  const mouseleave = function (event, d) {
    tooltip.style('opacity', 0);
  };

  // Add dots
  svgBubble
    .append('g')
    .selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'bubbles')
    .attr('cx', (d) => x(d.GDP))
    .attr('cy', (d) => y(d.Population))
    .attr('r', (d) => z(d.Co2Emissions))
    .style('fill', (d) => myColor(d.Country))
    .style('opacity', '0.7')
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave);
});

// Example matrix for demonstration (replace with your data matrix)
const matrix = [
  [0, 1000, 4000, 3000],
  [1000, 0, 2000, 1500],
  [4000, 2000, 0, 2500],
  [3000, 1500, 2500, 0],
];

const data = [
  { date: '2020-01', value: 30 },
  { date: '2020-02', value: 40 },
  { date: '2020-03', value: 80 },
  { date: '2020-04', value: 60 },
  { date: '2020-05', value: 100 },
  { date: '2020-06', value: 70 },
];

const margin = { top: 10, right: 30, bottom: 30, left: 50 },
  width1 = 460 - margin.left - margin.right,
  height1 = 400 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg1 = d3
  .select('#areaPlot')
  .append('svg')
  .attr('width', width1 + margin.left + margin.right)
  .attr('height', height1 + margin.top + margin.bottom)
  .append('g')
  .attr(
    'transform',
    `translate(${margin.left},${margin.top})`,
  );

// Parse the date / time
const parseTime = d3.timeParse('%Y-%m');

// X scale
const x = d3
  .scaleTime()
  .domain(d3.extent(data, (d) => parseTime(d.date)))
  .range([0, width]);

svg1
  .append('g')
  .attr('transform', `translate(0,${height1})`)
  .call(d3.axisBottom(x));

// Y scale
const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => +d.value)])
  .range([height, 0]);

svg1.append('g').call(d3.axisLeft(y));

// Color scale
const color = d3
  .scaleSequential()
  .interpolator(d3.interpolateCool)
  .domain([0, d3.max(data, (d) => +d.value)]);

// Add the area
svg1
  .append('path')
  .datum(data)
  .attr('fill', 'url(#areaGradient)') // Use gradient
  .attr('stroke', 'none')
  .attr(
    'd',
    d3
      .area()
      .x((d) => x(parseTime(d.date)))
      .y0(y(0))
      .y1((d) => y(d.value)),
  );

// Define the gradient
const defs = svg1.append('defs');
const gradient = defs
  .append('linearGradient')
  .attr('id', 'areaGradient')
  .attr('x1', '0%')
  .attr('x2', '0%')
  .attr('y1', '100%')
  .attr('y2', '0%');
gradient
  .append('stop')
  .attr('offset', '0%')
  .attr('stop-color', 'rgba(255, 255, 255, 0)'); // Adjust color
gradient
  .append('stop')
  .attr('offset', '100%')
  .attr('stop-color', () => d3.interpolateCool(1)); // Use cool color scale

const streamData = [
  {
    date: '2020-01',
    categoryA: 20,
    categoryB: 10,
    categoryC: 50,
  },
  {
    date: '2020-02',
    categoryA: 30,
    categoryB: 40,
    categoryC: 30,
  },
  {
    date: '2020-03',
    categoryA: 40,
    categoryB: 20,
    categoryC: 20,
  },
  {
    date: '2020-04',
    categoryA: 20,
    categoryB: 50,
    categoryC: 10,
  },
  {
    date: '2020-05',
    categoryA: 50,
    categoryB: 30,
    categoryC: 40,
  },
  {
    date: '2020-06',
    categoryA: 30,
    categoryB: 60,
    categoryC: 30,
  },
];

const marginStream = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 50,
  },
  widthStream =
    960 - marginStream.left - marginStream.right,
  heightStream =
    500 - marginStream.top - marginStream.bottom;

const svgStream = d3
  .select('#streamgraph')
  .append('svg')
  .attr(
    'width',
    widthStream + marginStream.left + marginStream.right,
  )
  .attr(
    'height',
    heightStream + marginStream.top + marginStream.bottom,
  )
  .append('g')
  .attr(
    'transform',
    `translate(${marginStream.left}, ${marginStream.top})`,
  );

const parseDate = d3.timeParse('%Y-%m');

// Transpose the data into layers
const stack = d3
  .stack()
  .keys(['categoryA', 'categoryB', 'categoryC'])
  .offset(d3.stackOffsetSilhouette)
  .order(d3.stackOrderInsideOut);

const layers = stack(
  streamData.map((d) => {
    return {
      date: parseDate(d.date),
      categoryA: +d.categoryA,
      categoryB: +d.categoryB,
      categoryC: +d.categoryC,
    };
  }),
);

// Set scales
const xScale = d3
  .scaleTime()
  .domain(d3.extent(layers[0], (d) => d.data.date))
  .range([0, widthStream]);

const yScale = d3
  .scaleLinear()
  .domain([
    d3.min(layers, (layer) => d3.min(layer, (d) => d[0])),
    d3.max(layers, (layer) => d3.max(layer, (d) => d[1])),
  ])
  .range([heightStream, 0]);

const color1 = d3.scaleOrdinal(d3.schemeCategory10);

// Add areas
const area = d3
  .area()
  .x((d) => xScale(d.data.date))
  .y0((d) => yScale(d[0]))
  .y1((d) => yScale(d[1]));

svgStream
  .selectAll('path')
  .data(layers)
  .enter()
  .append('path')
  .attr('d', area)
  .style('fill', (d, i) => color1(i));

// Add the X Axis
svgStream
  .append('g')
  .attr('transform', `translate(0,${heightStream / 2})`)
  .call(d3.axisBottom(xScale));

// Add the Y Axis
svgStream.append('g').call(d3.axisLeft(yScale));
