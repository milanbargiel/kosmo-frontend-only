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

const force = d3.layout.force()
	.nodes(dataset)
	.size([w, h])
	.charge([-100])
	.start();

const nodes = svg.selectAll('circle')
	.data(dataset)
	.enter()
	.append('circle')
	.attr('r', 10)
	.style('fill', 'steelblue')
	.call(force.drag);

force.on('tick', () => {
  nodes.attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y);
});
