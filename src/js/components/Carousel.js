class Carousel {
  constructor (element) {

    const thisCarousel = this;

    thisCarousel.render (element);
    thisCarousel.initPlugin ();

  }

  render (element) {
    const thisCarousel = this;

    thisCarousel.container = element;

  }

  initPlugin () {
    const thisCarousel = this;

    // eslint-disable-next-line no-undef
    new Flickity (thisCarousel.container, {
      cellAlign: 'left',
      contain: true,
      prevNextButtons: false,
      autoPlay: 3000,
    });
  }
}

export default Carousel;
