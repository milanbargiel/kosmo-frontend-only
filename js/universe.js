/* Universe definition
–––––––––––––––––––––––––––––––––––––––––––––––––– */
/**
  * Reference: http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout/9544595#9544595
  * A function is an object.
  * An object can act as a class, containing a constructor and a set of related methods (this).
*/

function Universe(selector, dataset) {
  let w = $(selector).innerWidth();
  let h = $(document).height(); // h is equal to height of HTML document
  const circleRadius = 50;

  /* Create svg container to hold the visualization */
  const svg = d3.select(selector)
      .append('svg')
      .attr('width', w)
      .attr('height', h);

  /* Clickable background rect to clear the current selection */
  const backgroundRect = svg.append('rect')
    .attr('width', w)
    .attr('height', h)
    .attr('opacity', 0)
    .on('click', clear);

  /* Create d3 force layout */
  const force = d3.layout.force()
    .gravity(0)
    .charge(0)
    .size([w, h]);

  const nodes = force.nodes();  // force dataset
  let circles = null;           // holding dom elements

  /* Insert existing data */
  nodes.push(...dataset);
  update();

/* Functions
–––––––––––––––––––––––––––––––––––––––––––––––––– */

/* Reference: http://bl.ocks.org/mbostock/1129492 */
  function bindToRectangle() {
    /* Returns a function which works on data of a single node */
    return (d) => {
      d.x = Math.max(circleRadius, Math.min(w - circleRadius, d.x));
      d.y = Math.max(circleRadius, Math.min(h - circleRadius, d.y));
    };
  }

  function update() {
    /* Join selection to data array -> results in three new selections enter, update and exit */
    circles = svg.selectAll('.planet')
      .data(nodes, d => d.id); // uniquely bind data to the node selection

    /* Add missing elements by calling append on enter selection */
    circles.enter()
      .append('circle')
      .attr('r', circleRadius)
      .attr('class', 'planet')
      /* Bind connectEvents method to elements */
      .call(connectEvents)
      .call(force.drag);

    /* Remove surplus elements from exit selection */
    circles.exit()
      .remove();

    /* Draw circle: Set svg circle attributes to force updated values */
    force.on('tick', () => {
      circles.each(bindToRectangle())
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    /* Restart the force layout */
    force.start();
  }

  /* Reference: http://bl.ocks.org/mbostock/3355967 */
  function resize() {
    w = $(selector).innerWidth();
    h = $(document).height();
    svg.attr('width', w).attr('height', h);
    backgroundRect.attr('width', w).attr('height', h);
    force.size([w, h]).resume();
  }

  d3.select(window).on('resize', resize);

/* Interactions
–––––––––––––––––––––––––––––––––––––––––––––––––– */
/* Reference: http://vallandingham.me/building_a_bubble_cloud.html */

  function click(object) { // object is selected nodes object
    /* iterates over nodes, if callback returns true, class is given */
    console.log(object);
    circles.classed('planet-selected', node => object.id === node.id);
  }

  function mouseover(object) {
    circles.classed('planet-hover', node => object.id === node.id);
  }

  function mouseout() {
    circles.classed('planet-hover', false);
  }

  /* Click on background rect triggers clear function */
  function clear() {
    circles.classed('planet-selected', false);
  }

  function connectEvents(selection) {
    selection.on('click', click);
    selection.on('mouseover', mouseover);
    selection.on('mouseout', mouseout);
  }

/* Add, remove
–––––––––––––––––––––––––––––––––––––––––––––––––– */

  /* Placeholder function, later integrate shortid */
  function createRandomId() {
    return Math.random().toFixed(20).slice(2);
  }

  function findNodeIndex(id) {
    return nodes.findIndex(node => node.id === id);
  }

  /* Methods - accessible from outside the function */
  this.addNode = text => {
    nodes.push({ id: createRandomId(), name: text });
    update();
  };

  this.removeNode = id => {
    const i = findNodeIndex(id);
    if (i !== -1) {
      nodes.splice(i, 1);
      update();
    }
  };
}

/* Instantiation
–––––––––––––––––––––––––––––––––––––––––––––––––– */

const dataset = [];
dataset.push({
  id: '22333',
  name: 'Elephant Dreams',
});
dataset.push({
  id: '222333',
  name: 'Rastafari Planet',
});
dataset.push({
  id: '2223333',
  name: 'New Planet',
});
/* Instantiate object with new */
const universe = new Universe('.universe-container', dataset);
