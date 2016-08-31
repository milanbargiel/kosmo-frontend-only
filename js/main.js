// Reference: http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout/9544595#9544595
/* Define class */
class Planet {
  constructor(selector) {
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

    this.planet = this.svg.append('circle')
      .attr('r', this.planetRadius)
      .attr('cx', this.w / 2)
      .attr('cy', this.w / 2)
      .attr('class', 'planet');

    this.force = d3.layout.force()
      .gravity(0.05)
      .friction(0.9)
      .charge(-50)
      .size([this.w, this.h]);

    this.nodes = this.force.nodes();
  }

  /* Methods */

  revealThought(d) {
    console.log(d.thought);
    console.log(d.id);
  }

  // Reference: http://stackoverflow.com/questions/8515900/how-to-constrain-movement-within-the-area-of-a-circle
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
    const circles = this.svg.selectAll('.node')
      .data(this.nodes, d => d.id); // joins are specified by d.id

    /* Add missing elements by calling append on enter selection */
    circles.enter()
      .append('circle')
      .attr('r', this.circleRadius)
      .attr('class', 'node')
      .on('click', (d) => { this.revealThought(d); });
      // .call(this.force.drag);

    /* Remove surplus elements from exit selection */
    circles.exit()
      .remove();

    /* Draw circle: Set svg circle attributes to force updated values */
    this.force.on('tick', () => {
      circles.each(this.bindToCircle())
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    /* Restart the force layout */
    this.force.start();
  }

  /* Placeholder function, later integrate shortid */
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
    const index = this.findThoughtIndex(id);
    if (index !== -1) {
      this.nodes.splice(index, 1);
      this.update();
    }
  }
}

/* Instantiate class planet with selector and initial data*/
const planet = new Planet('.planet-container');
planet.addThought('Hallo');
planet.addThought('Ballo');
planet.addThought('Yallo');
