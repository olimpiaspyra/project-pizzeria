import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor (menuProduct, element) {

    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;

    thisCartProduct.getElements(element);
    // console.log ('thisCartProduct', thisCartProduct);

    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

  }

  getElements (element) {

    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector (select.cartProduct.amountWidget);
    // console.log ('thisCartProduct.dom.amountWidget', thisCartProduct.dom.amountWidget);

    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector (select.cartProduct.price);
    // console.log ('thisCartProduct.dom.price', thisCartProduct.dom.price);

    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector (select.cartProduct.edit);
    // console.log ('thisCartProduct.dom.price', thisCartProduct.dom.edit);

    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector (select.cartProduct.remove);
    // console.log ('thisCartProduct.dom.price', thisCartProduct.dom.remove);

  }

  initAmountWidget () {

    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget (thisCartProduct.dom.amountWidget);

    thisCartProduct.dom.amountWidget.addEventListener ('updated', function () {

      console.log('click', thisCartProduct.dom.amountWidget);

      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      console.log ('amount', thisCartProduct.amount);

      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      console.log ('price', thisCartProduct.price);

      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      console.log ('price inner', thisCartProduct.dom.price.innerHTML);

    });
  }

  remove () {

    const thisCartProduct = this;

    const event = new CustomEvent ('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent (event);

  }

  initActions () {

    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener ('click', function (event) {
      event.preventDefault ();
    });

    thisCartProduct.dom.remove.addEventListener ('click', function (event) {
      event.preventDefault ();

      thisCartProduct.remove ();
      console.log ('remove', thisCartProduct.remove);

    });
  }

  getData () {
    const thisCartProduct = this;

    const orderData = {

      id: thisCartProduct.id,
      name: thisCartProduct.name,
      amount: thisCartProduct.amount,
      priceSingle: thisCartProduct.priceSingle,
      price:  thisCartProduct.price,
      params: thisCartProduct.params,

    };

    return orderData;
  }
}

export default CartProduct;
