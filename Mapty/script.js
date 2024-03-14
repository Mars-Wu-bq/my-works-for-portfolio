'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-8);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.speed = (this.distance / this.duration) * 60;
  }

  _description() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    // prettier-ignore
    this.description = `
    ${this.type[0].toUpperCase() + this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.pace = this.duration / this.distance;
    this._description();
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this._description();
  }
}

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    //prettier-ignore
    inputType.addEventListener('change', function () {
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
      inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    });

    form.addEventListener('submit', this._newWorkout.bind(this));

    containerWorkouts.addEventListener(
      'click',
      this.moveToClickedList.bind(this)
    );
  }

  //get user's location and show map
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Could not get your position')
      );
  }

  //show map
  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    console.log(
      `https://www.google.com/maps/@${latitude},${longitude},18z?entry=ttu`
    );

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //show form when clicking the map
    this.#map.on(
      'click',
      function (mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
        // console.log(mapE);
      }.bind(this)
    );

    this.getLocalStorage();
  }

  //submit the form
  _newWorkout(e) {
    e.preventDefault();
    let workout;

    //get input data
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value;
    const checkInputs = (...inputs) =>
      inputs.every(i => i > 0 && Number.isFinite(i));
    const { lat, lng } = this.#mapEvent.latlng;
    // console.log(lat,lng);

    if (inputType.value === 'running') {
      if (checkInputs(distance, duration, cadence)) {
        workout = new Running([lat, lng], distance, duration, cadence);
      } else {
        alert('inputs must be positive numbers.');
        return;
      }
    } else {
      if (checkInputs(distance, duration, elevation)) {
        workout = new Cycling([lat, lng], distance, duration, elevation);
      } else {
        alert('inputs must be positive numbers.');
        return;
      }
    }

    this.#workouts.push(workout);
    console.log(this.#workouts);

    this._renderMarker(workout);

    this._renderLists(workout);

    //clear inputs
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    //hide input form
    form.classList.add('hidden');

    this.setLocalStorage();
  }

  //move to clicked list
  moveToClickedList(e) {
    // console.log(e);
    if (!e.target.closest('.workout')) return;
    const dataId = e.target.closest('.workout').getAttribute('data-id');
    // console.log(dataId);
    const clickedWorkout = this.#workouts.find(
      workout => workout.id === dataId
    );
    this.#map.setView(clickedWorkout.coords, this.#mapZoomLevel, {
      animate: true,
      duration: 0.5,
    });
  }

  //store data to local storage
  setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  //restore data from local storage
  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(workout => this._renderLists(workout));
    this.#workouts.forEach(workout => this._renderMarker(workout));
  }

  //clear local storage
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }

  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          className: `${inputType.value}-popup`,
          maxWidth: 200,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴'} ${workout.description}`
      )
      .openPopup();
  }

  _renderLists(workout) {
    let html = `
   <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    `;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    } else if (workout.type === 'cycling') {
      html += `    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
   </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }
}

const run = new App();
// console.log(run);
