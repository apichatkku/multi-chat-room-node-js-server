$(function () {
  initialViewMode()

  function initialViewMode() {
      var viewMode = localStorage.getItem('viewMode');
      if (viewMode === 'dark') {
          $('body, .post').addClass('is-dark-mode');
      }
  }

  function toggleViewMode() {
      var viewMode = localStorage.getItem('viewMode');
      $('body, .post').toggleClass('is-dark-mode');
      localStorage.setItem('viewMode', viewMode === 'dark' ? 'light' : 'dark');
  }

  $('#toggle-theme-btn').on('click', function () {
      toggleViewMode();
  });
});