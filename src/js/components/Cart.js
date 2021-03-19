import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor (element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);

    console.log ('new cart', thisCart);

    thisCart.initActions ();
  }

  getElements (element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector (select.cart.toggleTrigger);
    // console.log ('cart toggle trigger', thisCart.dom.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector (select.cart.productList);
    // console.log ('product list', thisCart.dom.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    // console.log ('dom deliveryFee', thisCart.dom.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    // console.log ('dom subtotalPrice', thisCart.dom.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    // console.log ('dom totalPrice', thisCart.dom.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    // console.log ('dom form', thisCart.dom.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    // console.log ('address', thisCart.dom.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    // console.log ('phone', thisCart.dom.phone);

  }

  initActions () {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener ('click', function () {
      // console.log ('click');

      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener ('updated', function () {
      thisCart.update ();
    });

    thisCart.dom.productList.addEventListener ('remove', function (event) {
      thisCart.remove (event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener ('submit', function (event) {
      event.preventDefault ();

      thisCart.sendOrder ();
    });

  }

  add (menuProduct) {
    const thisCart = this;

    console.log ('adding product', menuProduct);

    const generatedHTML = templates.cartProduct (menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild (generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log ('thisCart.products', thisCart.products);

    thisCart.update ();

  }

  update () {

    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    // console.log ('deliveryFee', thisCart.deliveryFee);

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {

      thisCart.totalNumber += product.amount;
      // console.log ('total number', thisCart.totalNumber);
      thisCart.subtotalPrice += product.price;
      // console.log ('subtotal price', thisCart.subtotalPrice);

    }

    if (thisCart.totalNumber !== 0) {

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      // console.log ('total price', thisCart.totalPrice);

    } else {

      thisCart.deliveryFee = 0;
      thisCart.totalPrice = 0;

    }

    /* amount of item */

    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    // console.log ('total number inner', thisCart.dom.totalNumber.innerHTML);


    /* price without cost of delivery */

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    // console.log ('subtotal price inner', thisCart.dom.subtotalPrice.innerHTML);

    /* finish price */

    for (let i = 0; i < thisCart.dom.totalPrice.length; i++) {

      thisCart.dom.totalPrice[i].innerHTML = thisCart.totalPrice;
      // console.log ('total price inner', thisCart.dom.totalPrice[i].innerHTML);

    }

    /* cost of delivery */

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    // console.log ('delivery inner', thisCart.dom.deliveryFee.innerHTML);

  }

  remove (cartProduct) {

    const thisCart = this;

    const indexOfProduct = thisCart.products.indexOf (cartProduct);

    thisCart.products.splice (indexOfProduct, 1);

    cartProduct.dom.wrapper.remove();

    thisCart.update ();
  }

  sendOrder () {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let prod of thisCart.products) {

      payload.products.push (prod.getData());

    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Cart;
