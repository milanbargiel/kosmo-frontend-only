/* Planet definition
–––––––––––––––––––––––––––––––––––––––––––––––––– */
/**
  * Reference: http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout/9544595#9544595
  * A function is an object.
  * An object can act as a class, containing a constructor and a set of related methods (this).
*/

function Planet(selector, dataset) {
  let w = $(selector).innerWidth();
  let h = w;
  let center = { x: w / 2, y: h / 2 };
  let planetRadius = w / 2;
  const circleRadius = 15;
  /* Content function shows and hides node content in specified container */
  const content = contents('.thought');

  /* Create svg container to hold the visualization */
  const svg = d3.select(selector)
      .append('svg')
      .attr('width', w)
      .attr('height', h);

  /* Create svg circle as planet */
  const planet = svg.append('circle')
    .attr('r', planetRadius)
    .attr('cx', w / 2)
    .attr('cy', w / 2)
    .attr('class', 'planet')
    .on('click', clear);

  /* Create d3 force layout */
  const force = d3.layout.force()
    .gravity(0.05)
    .friction(0.9)
    .charge(-50)
    .size([w, h]);

  const nodes = force.nodes();  // force dataset
  let circles = null;           // holding dom elements

  /* Insert existing data */
  nodes.push(...dataset);
  update();

  /* See if url contains id already */
  hashchange();

  /* Call hashchange when url changes */
  d3.select(window)
    .on('hashchange', hashchange); // bind function to event

/* Functions
–––––––––––––––––––––––––––––––––––––––––––––––––– */

  /* Reference: http://stackoverflow.com/questions/8515900/how-to-constrain-movement-within-the-area-of-a-circle */
  /* Restrict elements to leave the svg circle planet */
  function bindToCircle() {
    /* Returns a function which works on data of a single node */
    return (d) => {
      /* Calculate connection vector from center of planet to point */
      const cp = { x: d.x - center.x, y: d.y - center.y };
      /* Calculate length of CP */
      const cpLength = Math.sqrt(Math.pow(cp.x, 2) + Math.pow(cp.y, 2));

      if (cpLength >= planetRadius) {
        /* Scale CP to length of planetRadius,
        translate origin of co-ordinates to center of planet */
        const s = ((planetRadius - circleRadius) / cpLength);
        d.x = (s * cp.x) + center.x;
        d.y = (s * cp.y) + center.y;
      }
    };
  }

  function update() {
    /* Join selection to data array -> results in three new selections enter, update and exit */
    circles = svg.selectAll('.node')
      .data(nodes, d => d.id); // uniquely bind data to the node selection

    /* Add missing elements by calling append on enter selection */
    circles.enter()
      .append('circle')
      .attr('r', circleRadius)
      .attr('class', 'node')
      /* Bind connectEvents method to elements */
      .call(connectEvents);
      // .call(force.drag);

    /* Remove surplus elements from exit selection */
    circles.exit()
      .remove();

    /* Draw circle: Set svg circle attributes to force updated values */
    force.on('tick', () => {
      circles.each(bindToCircle())
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    /* Restart the force layout */
    force.start();
  }

  /* Reference: http://bl.ocks.org/mbostock/3355967 */
  function resize() {
    w = $(selector).innerWidth();
    h = w;
    center = { x: w / 2, y: h / 2 };
    planetRadius = w / 2;
    svg.attr('width', w).attr('height', h);
    planet.attr('r', planetRadius)
      .attr('cx', w / 2)
      .attr('cy', w / 2);
    force.size([w, h]).resume();
  }
  d3.select(window).on('resize', resize);

/* Interactions
–––––––––––––––––––––––––––––––––––––––––––––––––– */
/**
  * Reference: http://vallandingham.me/building_a_bubble_cloud.html
  * When clicking on an object its id is pushed into the url.
  * An eventlistener listens to changes in the url.
  * On a change the content view is updated.
*/

  function click(object) { // object is selected nodes object
    /* iterates over nodes, if callback returns true, class is given */
    circles.classed('node-selected', node => object.id === node.id);
    /* Save state of visualization -> push id into the url */
    location.replace(`#${encodeURIComponent(object.id)}`);
  }

  function mouseover(object) {
    circles.classed('node-hover', node => object.id === node.id);
    if (!isSelected()) {
      content.show(object);
    }
  }

  function mouseout() {
    circles.classed('node-hover', false);
    if (!isSelected()) {
      content.hide();
    }
  }

  /* Click on svg planet triggers clear function */
  function clear() {
    circles.classed('node-selected', false);
    /* Push empty id into the url -> hides content in hashchange function */
    location.replace('#');
  }

  function connectEvents(selection) {
    selection.on('click', click);
    selection.on('mouseover', mouseover);
    selection.on('mouseout', mouseout);
  }

  /* hashchange method is fired when url changes */
  function hashchange() {
    /* Get id from URL */
    const id = decodeURIComponent(location.hash.slice(1)).trim();
    /* If no thought is selected -> hide content */
    if (!id) {
      content.hide();
      return;
    }
    /* find node by id -> show content */
    const object = nodes[findNodeIndex(id)];
    content.show(object);
  }

  /* Checks wether content was selected (indicator: id in url) */
  function isSelected() {
    if (decodeURIComponent(location.hash.slice(1)).trim()) {
      return true;
    }
    return false;
  }

  /* return an array of node ids which contain specified tag */
  function findNodeIds(tag) {
    /* narrow down array. if return is true item is kept */
    const ids = nodes.filter(node => node.tags.includes(tag));
    /* make an array of ids only */
    return ids.map(node => node.id);
  }

  this.highlightNodes = tag => {
    const ids = findNodeIds(tag);
    /* assign class to all elements with specified ids */
    circles.classed('node-selected', node => ids.includes(node.id));
  };

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
    nodes.push({ id: createRandomId(), thought: text });
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
  thought: 'I had a dream about an green elephant. It asked me to travel on his back to India. When I accepted his offer he laughed at me and said that I am much to heavy. The elephant would rather go alone. #dream #elephant',
  tags: ['#dream', '#elephant'],
});
dataset.push({
  id: '222333',
  thought: 'He told students to get their diplomas and shared his dream of escape. #freddiegray #dream',
  tags: ['#freddiegray', '#dream'],
});
dataset.push({
  id: '2223333',
  thought: 'But they did not see any #trump Home mirrors or lotion dispensers',
  tags: ['#trump'],
});
dataset.push({
  id: '22233333',
  thought: 'When Jobs returned, it was a dark time for Apple. It was forced to team up with its archrival Microsoft, and even took a $150 million stock investment from the company, which was then run by Bill Gates. #elephant #dream',
  tags: ['#elephant', '#dream'],
});
/* Instantiate object with new */
const planet = new Planet('.planet-container', dataset);

/* Tags
–––––––––––––––––––––––––––––––––––––––––––––––––– */

/* Add click event listener on tags. Click on a tag -> highlight tagged nodes */
function setupTags() {
  d3.select('.tag-cloud')
    .selectAll('.tag')
    .on('click', function () { // use normal function so 'this' is dom element
      /* Get tag name */
      const tag = d3.select(this).text();
      planet.highlightNodes(tag);
    });
}

setupTags();
