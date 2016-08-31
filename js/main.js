/* Class Definition
–––––––––––––––––––––––––––––––––––––––––––––––––– */

/* Reference: http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout/9544595#9544595 */
class Planet {
  constructor(selector, nodes) {
    this.w = $(selector).innerWidth();
    this.h = this.w;
    this.center = { x: (this.w / 2), y: (this.h / 2) };
    this.planetRadius = this.w / 2;
    this.circleRadius = 15;

    /* Create svg container to hold the visualization */
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', this.w)
      .attr('height', this.h);

    /* Create svg circle as planet */
    this.planet = this.svg.append('circle')
      .attr('r', this.planetRadius)
      .attr('cx', this.w / 2)
      .attr('cy', this.w / 2)
      .attr('class', 'planet')
      .on('click', () => { this.clear(); });

    /* Create d3 force layout */
    this.force = d3.layout.force()
      .gravity(0.05)
      .friction(0.9)
      .charge(-50)
      .size([this.w, this.h]);

    this.nodes = this.force.nodes();    // dataset
    this.circles = null;                // holding dom elements

    /* Insert existing data */
    this.nodes.push(...nodes);
    this.update();

    /* See if url contains id already */
    this.hashchange();

    /* Call hashchange when url changes */
    d3.select(window)
      .on('hashchange', () => { this.hashchange(); }); // bind function to event
  }

/* Methods
–––––––––––––––––––––––––––––––––––––––––––––––––– */

  /* Reference: http://stackoverflow.com/questions/8515900/how-to-constrain-movement-within-the-area-of-a-circle */
  /* Restrict elements to leave the svg circle planet */
  bindToCircle() {
    /* Returns a function which works on data of a single node */
    return (d) => {
      /* Calculate connection vector from center of planet to point */
      const cp = { x: d.x - this.center.x, y: d.y - this.center.y };
      /* Calculate length of CP */
      const cpLength = Math.sqrt(Math.pow(cp.x, 2) + Math.pow(cp.y, 2));

      if (cpLength >= this.planetRadius) {
        /* Scale CP to length of planetRadius,
        translate origin of co-ordinates to center of planet */
        const s = ((this.planetRadius - this.circleRadius) / cpLength);
        d.x = (s * cp.x) + this.center.x;
        d.y = (s * cp.y) + this.center.y;
      }
    };
  }

  update() {
    /* Join selection to data array -> results in three new selections enter, update and exit */
    this.circles = this.svg.selectAll('.node')
      .data(this.nodes, d => d.id); // uniquely bind data to the node selection

    /* Add missing elements by calling append on enter selection */
    this.circles.enter()
      .append('circle')
      .attr('r', this.circleRadius)
      .attr('class', 'node')
      /* Bind connectEvents method to elements */
      .call(d => { this.connectEvents(d); });
      // .call(this.force.drag);

    /* Remove surplus elements from exit selection */
    this.circles.exit()
      .remove();

    /* Draw circle: Set svg circle attributes to force updated values */
    this.force.on('tick', () => {
      this.circles.each(this.bindToCircle())
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    /* Restart the force layout */
    this.force.start();
  }

/* Show content interactions
–––––––––––––––––––––––––––––––––––––––––––––––––– */

/**
  * Reference: http://vallandingham.me/building_a_bubble_cloud.html
  * When clicking on an object its id is pushed into the url.
  * An eventlistener listens to changes in the url.
  * On a change the thought view is updated.
*/

  connectEvents(d) {
    d.on('click', (object) => this.click(object));
    d.on('mouseover', (object) => this.mouseover(object));
    d.on('mouseout', () => this.mouseout());
  }

  click(object) {
    this.circles.classed('node-selected', d => object.id === d.id);
    /* Save state of visualization -> push id into the url */
    location.replace(`#${encodeURIComponent(object.id)}`);
  }

  mouseover(object) {
    this.circles.classed('node-hover', d => object.id === d.id);
    if (!this.isSelected()) {
      this.updateThoughtView(object.id);
    }
  }

  mouseout() {
    this.circles.classed('node-hover', false);
    if (!this.isSelected()) {
      this.updateThoughtView('');
    }
  }
  /* hashchange method is fired when url changes */
  hashchange() {
    const id = decodeURIComponent(location.hash.slice(1)).trim();
    this.updateThoughtView(id);
  }

  updateThoughtView(id) {
    /* If no thought is selected -> empty view */
    if (!id) {
      d3.select('.thought')
        .text('');
      return;
    }
    const i = this.findThoughtIndex(id);
    const text = this.nodes[i].thought;
    d3.select('.thought')
      .text(text);
  }

  /* Click on svg planet triggers clear method */
  clear() {
    this.circles.classed('node-selected', false);
    location.replace('#');
  }

  isSelected() {
    if (decodeURIComponent(location.hash.slice(1)).trim()) {
      return true;
    }
    return false;
  }

/* Add, remove
–––––––––––––––––––––––––––––––––––––––––––––––––– */

  /* Placeholder method, later integrate shortid */
  createRandomId() {
    return Math.random().toFixed(20).slice(2);
  }

  addThought(text) {
    this.nodes.push({ id: this.createRandomId(), thought: text });
    this.update();
  }

  findThoughtIndex(id) {
    return this.nodes.findIndex(node => node.id === id);
  }

  removeThought(id) {
    const i = this.findThoughtIndex(id);
    if (i !== -1) {
      this.nodes.splice(i, 1);
      this.update();
    }
  }
}

/* Instantiation of class with initial data
–––––––––––––––––––––––––––––––––––––––––––––––––– */

const nodes = [];
nodes.push({ id: '223323', thought: 'Hallo Babacoush' });
nodes.push({ id: '2233223', thought: 'Monsieur Coubertus' });
nodes.push({ id: '22333', thought: 'Baba Janusch' });

const planet = new Planet('.planet-container', nodes);
