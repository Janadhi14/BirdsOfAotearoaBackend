

/*
* Declaring variables  
*/
const birdDataUrl = "./data/nzbird.json";
const container = document.getElementById('flex-container');
const numBirds = document.getElementById('results');
let birdArr = [];
const statusArr = new Array(
  "Not Threatened",
  "Naturally Uncommon",
  "Relict",
  "Recovering",
  "Declining",
  "Nationally Increasing",
  "Nationally Vulnerable",
  "Nationally Endangered",
  "Nationally Critical",
  "Data Deficient"
);

/**
 * Fetching data 
 */
async function fetchData() {
  const response = await fetch(birdDataUrl);
  // in the case that we are not able to fetch the data we need to handel the error
  if (!response.ok) {
    console.error(response.status);
    const errorMessage = document.createElement('p');
    errorMessage.setAttribute('class', 'error');
    errorMessage.textContent = "ERROR: unable to load birds from server.";
    container.append(errorMessage);
  }
  const birdData = await response.json();
  // for loop to go through and create a panel for each bird 
  for (let j = 0; j < birdData.length; j++) {
    birdPanel(birdData[j]);
  }
}



// birdPanel function to go through and create pandels for each bird using the data 
function birdPanel(bird) {
  const birdNum = bird.scientific_name.replaceAll(" ", ""); // getting rid of the spaces 
  // panel for each bird 
  const panel = `<div class="panel" id = "${birdNum}">
      <img src=${bird.photo.source} alt="Photo of ${bird.english_name}" class="bird-imag">
      <div class="overlay">
          <div class="circle" style="background-color:var(--${bird.status.replaceAll(' ', '-')})";> </div>
      </div>
  
      <h2 class="maori-name" id = "maori-name">${bird.primary_name}</h2>
      <p class="photographer">Photo by ${bird.photo.credit}</p>
      
      <h2 class = "english-name" id = "english-name">${bird.english_name}</h2>

      <div class="eachPanel">
          <p class="panel-text" id = panel-id >Scientific Name</p> <p>${bird.scientific_name}</p>
          <p class="panel-text" id = panel-id>Family</p>         <p>${bird.family} </p>
          <p class="panel-text" id = panel-id>Order</p>          <p>${bird.order} </p>
          <p class="panel-text" id = panel-id>Status</p>         <p>${bird.status} </p>
          <p class="panel-text" id = panel-id>Length</p>         <p>${bird.size.length.value + ' ' + bird.size.length.units} </p>
          <p class="panel-text" id = panel-id>Weight</p>         <p>${bird.size.weight.value + ' ' + bird.size.weight.units} </p>

      </div>

      <div class="button-container">
            <a class="ved-button" id = view href="/birds/${birdNum}">View</a><br>
            <a class="ved-button" id = edit href="/birds/${birdNum}/Edit">Edit</a><br>
            <a class="ved-button" id = delete href="/birds/${birdNum}/Delete">Delete</a>
        </div>
  </div>`;
  // adding the panel into the container 
  container.insertAdjacentHTML("beforeend", panel);
  bird.element = document.getElementById(birdNum);

  birdArr.push(bird);

}


/**
 * matching the name with the search word function
 */
function match(searchWord, bird) {
  const englishName = bird.english_name.toLowerCase();
  const maoriName = bird.primary_name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); // normalised so maori words can be found
  const scientificName = bird.scientific_name.toLowerCase();
  //need to return true if any of the maori name or english names or scientific names are contain search word
  if (englishName.includes(searchWord) || maoriName.includes(searchWord) || scientificName.includes(searchWord)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Function to add birds to container that match search terms
 * also should checks if the serach term is valid 
 */
function addBirds(currentBirds) {
  // need to start off with nothing in the innerHMTL and then we need to append
  container.innerHTML = "";
  currentBirds.forEach(bird => {
    container.append(bird.element);
  });
  // changing the birds found to the number that we get from currentBirds that meet the citeria
  numBirds.textContent = currentBirds.length + " results found.";
  // if we can't find the search term then this error message should show up 
  if (currentBirds.length === 0) {
    const errorMessage = document.createElement('h1');
    errorMessage.textContent = "There are no birds that match the search term!";
    container.append(errorMessage);
  }
}

/**
 * sort-by functions 
 * will need to compare x to y for each characterstic 
 */
// simple comparator function
function createComparator(key, reverse = false) {
  return (x, y) => {
    const a = x[key];
    const b = y[key];
    // if the keys are in reverse
    if (reverse) {
      return a < b ? 1 : (a > b ? -1 : 0);
    }
    return a < b ? -1 : (a > b ? 1 : 0);
  };
}
//creating a nested comparator 
function createComparatorNested(key1, key2, reverse = false) {
  return (x, y) => {
    const a = x[key1][key2].value;
    const b = y[key1][key2].value;

    if (reverse) {
      return a < b ? 1 : (a > b ? -1 : 0);
    }
    return a < b ? -1 : (a > b ? 1 : 0);
  };
}

// matching up using createComparatorfunctions 
const alphabeticalEnglish = createComparator('english_name');
const alphabeticalMaori = createComparator('primary_name');
const lightestToHeaviest = createComparatorNested('size', 'weight');
const heaviestToLightest = createComparatorNested('size', 'weight', true);
const shortestToLongest = createComparatorNested('size', 'length');
const longestToShortest = createComparatorNested('size', 'length', true);


// when teh filter button is pressed 
document.getElementById("filter-button").addEventListener('click', function () {
  const searchTerm = document.querySelector("#search-bar").value;
  let currentBirdsArr = birdArr.slice();
  // if search filter is nothing
  if (searchTerm === "") {
    currentBirdsArr = birdArr.slice();
  } else {
    // else there is something in the search query and we want to create and array of birds to hold the birds 
    currentBirdsArr = [];
    let query = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    birdArr.forEach(bird => {
      // if the name matches then we want to push the specific bird onto the currentBirdArray
      if (match(query, bird)) {
        currentBirdsArr.push(bird);
      }
    });
  }

  // conservation status  checker 
  const conservStatus = document.querySelector("#status-sort").selectedIndex;

  if (conservStatus > 0) {
    const selectedStatus = statusArr[conservStatus - 1];

    currentBirdsArr = currentBirdsArr.filter(bird => bird.status === selectedStatus);
  }

  // array of sorting functions
  const sortingFunctions = [
    alphabeticalEnglish,
    alphabeticalMaori,
    lightestToHeaviest,
    heaviestToLightest,
    shortestToLongest,
    longestToShortest
  ];

  //getting the idvalue via index
  const idValue = document.querySelector("#by-sort").selectedIndex;

  // makes sure that the selected index is legitimate and sorts using the corresponding function
  if (idValue >= 0 && idValue < sortingFunctions.length) {
    currentBirdsArr.sort(sortingFunctions[idValue]);
  }
  // finally we are adding the current bird 
  addBirds(currentBirdsArr);
});

// function to show birds that are of the same type in terms of conservation status using circles
document.addEventListener("DOMContentLoaded", function () {
  const statusContainers = document.querySelectorAll('.status-container');
  statusContainers.forEach((container, index) => {
    container.addEventListener('click', function () {
      filterBirdsByStatus(index);
    });
  });
});

function filterBirdsByStatus(statusIndex) {
  // gets the corresponding status from the statusArr using index
  const status = statusArr[statusIndex];
  const currentBirdsArr = birdArr.filter(bird => bird.status === status);
  // updating the container with the filtered birds
  addBirds(currentBirdsArr);
}

// call to the fetchData func 
fetchData()


/*
* Darkmode function 
*/

let darkMode = localStorage.getItem('darkMode');
const darkModeToggle = document.querySelector('#dark-mode-toggle');

const enableDarkMode = () => {
  // adding the class to the body and updating local storage 
  document.body.classList.add('darkmode');
  localStorage.setItem('darkMode', 'enabled');
}

// disable dark mode function
const disableDarkMode = () => {
  // removing the class from the body and updating the darkmode in local storage 
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkMode', null);
}

//if the user left on darkmode then they should start on darkmode
if (darkMode === 'enabled') {
  enableDarkMode();
}

// eventListener for the darkmode button
darkModeToggle.addEventListener('click', () => {
  //getting the stored settings 
  darkMode = localStorage.getItem('darkMode');
  if (darkMode !== 'enabled') {
    enableDarkMode();
    // if enabled, we turn it off  
  } else {
    disableDarkMode();
  }

});



