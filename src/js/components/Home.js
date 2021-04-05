import {templates, select} from '../settings.js';
import Carousel from './Carousel.js';

class Home {
  constructor (element) {
    const thisHome = this;

    thisHome.render (element);
    thisHome.initWidgets ();
    thisHome.initPages ();
  }

  render (element) {
    const thisHome = this;

    const generatedHTML = templates.home();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.carousel = document.querySelector (select.widgets.carousel.container);
    thisHome.dom.wrapper.orderOnline = document.querySelector (select.home.orderOnline);
    console.log ('order online', thisHome.dom.wrapper.orderOnline);
    thisHome.dom.wrapper.bookTable = document.querySelector (select.home.bookTable);
    console.log ('book table', thisHome.dom.wrapper.bookTable);
    thisHome.dom.pages = document.querySelector (select.containerOf.pages).children;
    console.log ('pages', thisHome.dom.pages);
    thisHome.dom.navLinks = document.querySelectorAll (select.nav.links);
    console.log ('nav links', thisHome.dom.navLinks);

  }

  initWidgets () {
    const thisHome = this;

    thisHome.carouselWidget = new Carousel (thisHome.dom.carousel);

  }

  initPages () {

    const thisHome = this;

    thisHome.dom.wrapper.orderOnline.addEvenListener ('click', function () {
      console.log ('click');


    });


    thisHome.dom.wrapper.bookTable.addEvenListener ('click', function () {
      console.log ('click');
    });

  }

}

export default Home;
