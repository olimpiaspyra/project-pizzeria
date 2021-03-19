import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor (id, data) {
    const thisProduct = this;
    thisProduct.id = id;

    // console.log('product id:', thisProduct.id);

    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.initAccordion();

    // console.log ('new product:', thisProduct);

  }

  renderInMenu () {
    const thisProduct = this;

    /* generate HTML based on template */

    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */

    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */

    menuContainer.appendChild(thisProduct.element);

  }

  getElements () {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    // console.log ('accordion trigger:', thisProduct.accordionTrigger);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    // console.log ('form:', thisProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    // console.log ('form inputs:', thisProduct.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    // console.log('cars button:', thisProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    // console.log ('price elem:', thisProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    // console.log ('image wrapper:', thisProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    // console.log ('amount widget elem:', thisProduct.amountWidgetElem);

  }

  initAccordion () {
    const thisProduct = this;

    /* find the clickable trigger (the element that should be clicking */

    // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    // console.log ('clickable trigger:', clickableTrigger);

    /* START: add event listener to clickable trigger on event click */

    thisProduct.accordionTrigger.addEventListener('click', function (event) {

      /* prevent default action for event */

      event.preventDefault();

      /* find active product (product that has active class */

      const activeProduct = document.querySelector(select.all.menuProductsActive);
      // console.log ('active product:', activeProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */

      if (activeProduct !== null && activeProduct !== thisProduct.element) {

        activeProduct.classList.remove('active');

      }

      /* toggle active class on thisProduct.element */

      thisProduct.element.classList.toggle('active');

    });
  }

  initOrderForm () {
    const thisProduct = this;
    // console.log('init order form:', this.initOrderForm);

    thisProduct.form.addEventListener ('submit', function (event) {
      event.preventDefault ();
      thisProduct.processOrder ();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener ('change', function () {
        thisProduct.processOrder ();
      });
    }
    thisProduct.cartButton.addEventListener ('click', function (event) {
      event.preventDefault ();
      thisProduct.processOrder ();
      thisProduct.addToCart ();
    });
  }

  processOrder () {
    const thisProduct = this;
    // console.log ('process order:', this.processOrder);

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}

    const formData = utils.serializeFormToObject (thisProduct.form);
    // console.log ('form data:', formData);

    // set price to default price

    let price = thisProduct.data.price;

    // for every category (param)...

    for (let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }

      const param = thisProduct.data.params[paramId];
      // console.log ('param id:', paramId);
      // console.log ('param:', param);

      // for every option in this category

      for (let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }

        const option = param.options[optionId];
        // console.log ('option id:', optionId);
        // console.log ('option:', option);

        const optionPrice = option.price;
        // console.log ('option price:', optionPrice);

        // check if there is param with a name of paramId in formData and if it includes optionId

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {

          // check if the option is not default

          if (!option.default) {

            // add option price to price variable

            price += optionPrice;
            // console.log ('price increase:', price);

          }
        }
        else {

          // check if the option is default

          if (option.default) {

            // reduce price variable

            price -= optionPrice;
            // console.log ('price decrease:', price);
          }
        }

        const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);
        // console.log('.paramId-optionId:', paramId, optionId);
        // console.log ('option image:', optionImage);

        if (optionImage) {
          if (optionSelected) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
            // console.log ('image add active:', optionImage);
          }
          else {
            if (!optionSelected) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
              // console.log ('image remove active:', optionImage);
            }
          }
        }
      }
    }

    /* update actual price for every change option to product after init processOrder */

    thisProduct.priceSingle = price;
    // console.log ('price single', thisProduct.priceSingle);

    /* multiply price by amount */

    price *= thisProduct.amountWidget.value;
    thisProduct.priceMulti = price;
    // console.log ('price multi', price);

    // update calculated price in the HTML

    thisProduct.priceElem.innerHTML = price;
    // console.log ('actual price:', thisProduct.priceElem);

  }

  initAmountWidget () {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget (thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener ('updated', function () {

      thisProduct.processOrder();

    });
  }

  addToCart () {
    const thisProduct = this;

    // app.cart.add (thisProduct.prepareCartProduct());

    const event = new CustomEvent ('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      }
    });

    thisProduct.element.dispatchEvent (event);

  }

  prepareCartProduct () {
    const thisProduct = this;

    const productSummary = {

      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price:  thisProduct.priceMulti,
      params: thisProduct.prepareCartProductParams (),

    };

    return productSummary;

  }

  prepareCartProductParams () {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);

    const params = {};

    // for every category (param) //

    for (let paramId in thisProduct.data.params) {


      const param = thisProduct.data.params[paramId];
      // console.log ('param id:', paramId);
      // console.log ('param:', param);

      // create category param in params const eg. params = {ingredients {name: 'Ingredients', options: {}}} //

      params[paramId] = {
        label: param.label,
        // options: {},
        options: [],

      };

      // for every option in this category //

      for (let optionId in param.options) {

        const option = param.options[optionId];
        // console.log ('option id:', optionId);
        // console.log ('option:', option);


        // check if there is param with a name of paramId in formData and if it includes optionId

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {

          // params[paramId].options[optionId] = option.label;
          params[paramId].options.push(option.label);

        }
      }
    }
    return params;
  }
}

export default Product;
