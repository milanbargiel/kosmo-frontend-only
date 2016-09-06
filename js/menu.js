/* menu function
–––––––––––––––––––––––––––––––––––––––––––––––––– */
/* Create menu which floats on top of visualization */
/* Reference: https://github.com/vlandham/bubble_chart */

function menu() {
  const m = d3.select('body')
    .append('div')
    .attr('class', 'menu')
    .style('pointer-events', 'none');

  function show(content, event) {
    m.style('opacity', 1.0)
      .html(content);

    updatePosition(event);
  }

  function hide() {
    m.style('opacity', 0.0);
  }

  function updatePosition(event) {
    
  }

  return {
    show,
    hide,
  };
}
