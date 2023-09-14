document.addEventListener("DOMContentLoaded", function() {
  
    // Fetch data from store
    let expiryDates = store?.nseFetchStore.expiryDates || [];
  
    let searchInput = document.getElementById("expiryDateDropdownSearch");
    let dropdownList = document.getElementById("expiryDateDropdownList");
  
    searchInput.addEventListener("input", function() {
      let filteredData = expiryDates.filter(option => option.includes(searchInput.value));
      populateDropdown(filteredData);
    });
  
    searchInput.addEventListener("focus", function() {
      dropdownList.style.display = "block";
    });
  
    searchInput.addEventListener("blur", function() {
      setTimeout(function() { // This delay allows clicking on the dropdown items
        dropdownList.style.display = "none";
      }, 100);
    });
  
    function populateDropdown(items) {
      dropdownList.innerHTML = '';
      items.forEach(item => {
        let div = document.createElement("div");
        div.textContent = item;
        div.addEventListener("click", function() {
          searchInput.value = item;
          dropdownList.style.display = "none";
        });
        dropdownList.appendChild(div);
      });
    }
  
    populateDropdown(expiryDates);  // Initial population of dropdown with all dates
  
  });
  