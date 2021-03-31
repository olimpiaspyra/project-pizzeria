import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor (element) {

    const thisBooking = this;

    thisBooking.reservationTable = '';
    thisBooking.starters = [];

    thisBooking.render (element);
    thisBooking.initWidgets ();
    thisBooking.getData ();

  }

  getData () {
    const thisBooking = this;

    const startDateParam =  settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {

      booking: [
        startDateParam,
        endDateParam,
      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log ('getData params', params);

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
    };

    // console.log ('getData urls', urls);

    Promise.all ([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all ([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        // console.log (bookings);
        // console.log (eventsCurrent);
        // console.log (eventsRepeat);

        thisBooking.parseData (bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData (bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked (item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked (item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays (loopDate, 1)) {
          thisBooking.makeBooked (utils.dateToStr (loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log ('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM ();

  }

  makeBooked (date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber (hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);

    }
  }

  initTables (event) {
    const thisBooking = this;

    const clickedElement = event.target;

    const tableId = clickedElement.getAttribute (settings.booking.tableIdAttribute);

    if (clickedElement.classList.contains (classNames.booking.tableBooked)) {

      alert ('Stolik niedostępny');

    } else {

      if (clickedElement.classList.contains (classNames.booking.tableSelected)) {

        clickedElement.classList.remove (classNames.booking.tableSelected);
        thisBooking.reservationTable = '';

      } else {

        for (let table of thisBooking.dom.tables) {

          table.classList.remove (classNames.booking.tableSelected);

        }

        clickedElement.classList.add (classNames.booking.tableSelected);
        thisBooking.reservationTable = tableId;

      }
    }
  }

  updateDOM () {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber (thisBooking.hourPicker.value);

    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] === 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {

      let tableId = table.getAttribute (settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt (tableId);
      }

      if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add (classNames.booking.tableBooked);
      } else {
        table.classList.remove (classNames.booking.tableBooked);
        table.classList.remove (classNames.booking.tableSelected);
      }
    }
  }

  render (element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector (select.booking.peopleAmount);
    // console.log ('people amount', thisBooking.dom.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector (select.booking.hoursAmount);
    // console.log ('hours amount', thisBooking.dom.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector (select.widgets.datePicker.wrapper);
    // console.log ('date picker', thisBooking.dom.datePicker);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector (select.widgets.hourPicker.wrapper);
    // console.log ('hour picker', thisBooking.dom.hourPicker);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll (select.booking.tables);

    thisBooking.dom.selectTable = thisBooking.dom.wrapper.querySelectorAll (select.booking.tables);
    // console.log ('select table', thisBooking.dom.selectTable);

    thisBooking.dom.planTable = thisBooking.dom.wrapper.querySelector (select.booking.planTable);
    // console.log ('plan table', thisBooking.dom.planTable);

    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector (select.cart.address);
    console.log ('address', thisBooking.dom.address);

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector (select.cart.phone);
    console.log ('phone', thisBooking.dom.phone);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelector (select.booking.starters);
    console.log ('starters', thisBooking.dom.starters);

    thisBooking.dom.bookTable = thisBooking.dom.wrapper.querySelector (select.booking.bookTable);
    console.log ('bookTable', thisBooking.dom.bookTable);

  }

  initWidgets () {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget (thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget (thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker (thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker (thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener ('updated', function () {
      thisBooking.updateDOM ();
    });

    thisBooking.dom.planTable.addEventListener ('click', function (event) {
      console.log ('click');
      thisBooking.initTables (event);
    });

    thisBooking.dom.bookTable.addEventListener ('click', function () {
      thisBooking.sendBooking ();
    });

    thisBooking.dom.starters.addEventListener ('click', function (event) {

      const clickedElement = event.target;
      console.log ('clicked element', clickedElement);

      if (clickedElement.tagName === 'INPUT' && clickedElement.type === 'checkbox' && clickedElement.name === 'starter') {

        console.log (clickedElement.value);

        if (clickedElement.checked) {

          thisBooking.starters.push (clickedElement.value);
          console.log (thisBooking.starters);
        }

        else {

          const indexOfStarters = thisBooking.starters.indexOf (clickedElement.value);
          thisBooking.starters.splice (indexOfStarters, 1);
          console.log (thisBooking.starters);

        }}
    });
  }

  sendBooking () {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      table: parseInt (thisBooking.reservationTable),
      duration: parseInt ( thisBooking.hoursAmount.value),
      ppl:  parseInt (thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    for (let starter of thisBooking.starters) {

      payload.starters.push (starter);

    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch (url, options)
      .then (function () {
        thisBooking.makeBooked (payload.date, payload.hour, payload.duration, payload.table);});

  }
}

export default Booking;
