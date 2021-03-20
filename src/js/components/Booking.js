import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor (element) {

    const thisBooking = this;

    thisBooking.render (element);
    thisBooking.initWidgets ();

  }

  render (element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector (select.booking.peopleAmount);
    console.log ('people amount', thisBooking.dom.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector (select.booking.hoursAmount);
    console.log ('hours amount', thisBooking.dom.hoursAmount);

  }

  initWidgets () {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget (thisBooking.dom.peopleAmount);

    // thisBooking.peopleAmount.addEventListener ('updated', function () {

    // });

    thisBooking.hoursAmount = new AmountWidget (thisBooking.dom.hoursAmount);

    // thisBooking.hoursAmount.addEventListener ('updated', function () {

    // });

  }
}

export default Booking;
