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
  const marginCircleMenu = 24;  // distance between menu and planet (tick function)
  const circleRadius = 50;

  /* Create svg container to hold the visualization */
  const svg = d3.select(selector)
      .append('svg')
      .attr('width', w)
      .attr('height', h);

  /* Create div container to hold menus */
  const menuContainer = d3.select(selector)
    .append('div')
    .attr('class', 'menu-container');

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
  let labels = null;            // holding menus of nodes
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

  /* Reference: http://vallandingham.me/building_a_bubble_cloud.html */
  function updateNodes() {
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
  }

  function updateLabels() {
    /* Join selection to data array -> results in three new selections enter, update and exit */
    labels = menuContainer.selectAll('.menu')
      .data(nodes, d => d.id); // uniquely bind data to the node selection

    const labelsEnter = labels.enter()
      .append('div')
      .attr('class', 'menu');

    labelsEnter.append('a')
      .attr('class', 'menu__header')
      .text(d => d.name)
      /* Add dx (half width of menu div) and dy property (height of menu div) to each node object */
      /* Use values to center and position menu div on circle in tick function */
      .each(function setMeasures(d) { // use function so this refers to dom element (menu__header)
        const elemMeasures = this.getBoundingClientRect();
        d.dx = elemMeasures.width / 2;
        d.dy = elemMeasures.height;
      });

    /* Create Menu Navigation */
    const menuNavigation = '<li>ENTER</li><li>Rename</li><li>Delete</li>';
    labelsEnter.append('ul')
      .attr('class', 'menu__navigation')
      .html(menuNavigation);

    labels.exit()
      .remove();
  }

  function update() {
    /* Update nodes and their menus */
    updateNodes();
    updateLabels();

    /* Draw circle: Set svg circle and html element attributes to force updated values */
    force.on('tick', () => {
      circles.each(bindToRectangle())
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      /* Html elements with position absolute */
      labels
        /* Center menu: d.x - half menu width */
        .style('left', d => `${d.x - d.dx}px`)
        /* Position menu vertically */
        .style('top', d => `${d.y - d.dy - circleRadius - marginCircleMenu}px`);
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
    circles.classed('planet-selected', node => object.id === node.id);
    labels.selectAll('.menu__header').classed('selected', node => object.id === node.id);
  }

  function mouseover(object) {
    circles.classed('planet-hover', node => object.id === node.id);
    labels.selectAll('.menu__header').classed('active', node => object.id === node.id);
  }

  function mouseout() {
    circles.classed('planet-hover', false);
    labels.selectAll('.menu__header').classed('active', false);
  }

  /* Click on background rect triggers clear function */
  function clear() {
    circles.classed('planet-selected', false);
    labels.selectAll('.menu__header').classed('selected', false);
  }

  function connectEvents(selection) {
    selection.on('mousedown', click);
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
