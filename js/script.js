$(document).ready(() => {
  $('.tag').click((event) => {
    event.preventDefault();
  });
  $('.menu__header').click(function (event) {
    event.preventDefault();
    $(this).siblings('.menu__navigation').toggle();
  });
});
