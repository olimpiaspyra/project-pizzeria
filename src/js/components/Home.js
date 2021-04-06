import {templates, select} from '../settings.js';
import Carousel from './Carousel.js';

class Home {
  constructor (element) {
    const thisHome = this;

    thisHome.render (element);
    thisHome.initWidgets ();

  }

  render (element) {
    const thisHome = this;

    const generatedHTML = templates.home();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.carousel = document.querySelector (select.widgets.carousel.container);
  }

  initWidgets () {
    const thisHome = this;

    thisHome.carouselWidget = new Carousel (thisHome.dom.carousel);

  }
}

export default Home;
