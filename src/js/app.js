import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector (select.containerOf.pages).children;
    console.log ('pages',  thisApp.pages);
    // thisApp.navLinks = document.querySelectorAll (select.nav.links);
    // console.log (thisApp.navLinks);
    // thisApp.boxLinks = document.querySelectorAll (select.home.boxLinks);
    // // console.log (thisApp.boxLinks);
    // thisApp.links = document.querySelectorAll ('.main-nav a, .home-row a');
    thisApp.links = document.querySelectorAll (select.home.boxLinks + ', ' + select.nav.links);

    const idFromHash = window.location.hash.replace ('#/', '');
    // console.log ('id from hash', idFromHash);

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {

      if (page.id === idFromHash) {

        pageMatchingHash = page.id;
        break;

      }
    }

    // console.log ('page matching hash', pageMatchingHash);

    thisApp.activatePage (pageMatchingHash);

    for (let link of thisApp.links) {

      link.addEventListener ('click', function (event) {

        const clickedElement = this;
        event.preventDefault ();

        /* get page id from href attribute */

        const id = clickedElement.getAttribute ('href').replace ('#', '');

        /* run thisApp activatePage with that id */

        thisApp.activatePage (id);

        /* change URL hash */

        window.location.hash = '#/' + id;

      });
    }

    // for (let link of thisApp.boxLinks) {

    //   link.addEventListener ('click', function (event) {

    //     const clickedElement = this;
    //     event.preventDefault ();

    //     /* get page id from href attribute */

    //     const id = clickedElement.getAttribute ('href').replace ('#', '');

    //     /* run thisApp activatePage with that id */

    //     thisApp.activatePage (id);

    //     /* change URL hash */

    //     window.location.hash = '#/' + id;

    //   });
    // }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class 'active to matching pages, remove from non-matching */

    for (let page of thisApp.pages) {

      // if (page.id === page.Id) {
      //   page.classList.add (classNames.pages.active);
      // } else {
      //   page.classList.remove (classNames.pages.active);
      // }

      page.classList.toggle (classNames.pages.active, page.id === pageId);

    }

    /* add class 'active to matching links, remove from non-matching */

    for (let link of thisApp.links) {

      link.classList.toggle (
        classNames.nav.active,
        link.getAttribute ('href') === '#' + pageId);
    }
  },

  initMenu: function () {
    const thisApp = this;
    // console.log ('thisAppData:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;

    fetch (url)
      .then (function (rawResponse) {
        return rawResponse.json();
      })
      .then (function (parsedResponse) {
        console.log ('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */

        thisApp.data.products = parsedResponse;

        /* execute initMenu method */

        thisApp.initMenu();

      });

    console.log ('thisApp.data', JSON.stringify (thisApp.data));

  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector (select.containerOf.cart);
    thisApp.cart = new Cart (cartElem);

    thisApp.productList = document.querySelector (select.containerOf.menu);

    thisApp.productList.addEventListener ('add-to-cart', function (event) {

      app.cart.add (event.detail.product);

    });
  },

  init: function (){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
    thisApp.initHome();
    thisApp.initPages();
    thisApp.initBooking();

  },

  initBooking: function () {
    const thisApp = this;

    const containerBooking = document.querySelector (select.containerOf.booking);
    // console.log ('container booking', containerBooking);

    thisApp.booking = new Booking (containerBooking);

  },

  initHome: function () {
    const thisApp = this;

    const containerHome = document.querySelector (select.containerOf.home);

    thisApp.home = new Home (containerHome);
  }
};

app.init();
