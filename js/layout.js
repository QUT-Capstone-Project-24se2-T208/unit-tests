document.addEventListener("DOMContentLoaded", () => {
    // callout Header
    fetch('components/header.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
      });
  
    // callout Footer
    fetch('components/footer.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
      });
  });
  