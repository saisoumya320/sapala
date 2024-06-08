document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.slider');
  
    // Fetch the list of files from your API
    fetch('http://localhost:3000/files')
      .then((response) => response.json())
      .then((data) => {
        // Create HTML elements for each file name
        data.files.forEach((fileName) => {
          const fileElement = document.createElement('div');
          fileElement.textContent = fileName;
          slider.appendChild(fileElement);
        });
      })
      .catch((error) => {
        console.error('Error fetching files:', error);
      });
  });
  