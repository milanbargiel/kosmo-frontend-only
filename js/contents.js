function contents(selector) {
  const container = d3.select(selector);

  /* Methods */
  function show(object) {
    container.text(object.thought);
  }
  function hide() {
    container.text('');
  }
  /* return an object with functions */
  return {
    show,
    hide,
  };
}
