// Mobile nav toggle
document.getElementById('nav-toggle').addEventListener('click', function () {
  document.getElementById('nav-links').classList.toggle('open');
});

// Collapsible sections
document.querySelectorAll('.collapsible-header').forEach(function (btn) {
  btn.addEventListener('click', function () {
    this.parentElement.classList.toggle('open');
  });
});

// Show more / less for talks
(function () {
  var toggle = document.getElementById('talks-toggle');
  if (!toggle) return;
  var list = document.getElementById('talks-list');
  toggle.addEventListener('click', function () {
    var expanded = list.classList.toggle('expanded');
    toggle.textContent = expanded ? 'Show less' : 'Show more';
  });
})();

// Active nav on scroll
(function () {
  var sections = document.querySelectorAll('.section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  function onScroll() {
    var scrollPos = window.scrollY + 80;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
        var id = sec.getAttribute('id');
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
