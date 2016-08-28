/* Define class */
class Planet {
  constructor(selector) {
    this.w = $(selector).innerWidth();
    this.h = $(selector).innerHeight();

    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', this.w)
      .attr('height', this.h);

    this.force = d3.layout.force()
      .gravity(0.05)
      .charge(-100)
      .size([this.w, this.h]);

    this.nodes = this.force.nodes();
  }

  /* Methods (are called on object) */
  update() {
    /* Join selection to data array -> results in three new selections enter, update and exit */
    const circles = this.svg.selectAll('circle')
      .data(this.nodes, d => d.id); // arrow function, function(d) { return d.y;}

    /* Add missing elements by calling append on enter selection */
    circles.enter()
      .append('circle')
      .attr('r', 10)
      .style('fill', 'steelblue')
      .call(this.force.drag);

    /* Remove surplus elements from exit selection */
    circles.exit()
      .remove();

    this.force.on('tick', () => {
      circles.attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    /* Restart the force layout */
    this.force.start();
  }

  addThought(content) {
    this.nodes.push({ id: content });
    this.update();
  }

  findThoughtIndex(content) {
    return this.nodes.findIndex(node => node.id === content);
  }

  removeThought(content) {
    const index = this.findThoughtIndex(content);
    if (index !== -1) {
      this.nodes.splice(index, 1);
      this.update();
    }
  }
}

/* Instantiate class planet with selector and initial data*/
const planet = new Planet('.planet');
planet.addThought('Hallo');
planet.addThought('Ballo');
planet.addThought('Yallo');
