const w = 660;
const h = 250;

const dataset = [];
dataset.push({ name: 'Katze' });
dataset.push({ name: 'Hund' });
dataset.push({ name: 'Maus' });

const svg = d3.select('.planet')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

const simulation = d3.forceSimulation(dataset)
  .force('charge', d3.forceManyBody())
  .force('center', d3.forceCenter(w / 2, h / 2));

const nodes = svg.selectAll('circle')
  .data(dataset)
  .enter()
  .append('circle')
  .attr('r', 10)
  .style('fill', 'steelblue');

function ticked() {
  nodes.attr('cx', (d) => d.x)
  .attr('cy', d => d.y);
}

simulation.on('tick', ticked);
