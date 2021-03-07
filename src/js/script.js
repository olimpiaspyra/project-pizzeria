/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),

    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

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
      console.log ('amount widget elem:', thisProduct.amountWidgetElem);

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
      console.log ('price single', thisProduct.priceSingle);

      /* multiply price by amount */

      price *= thisProduct.amountWidget.value;
      thisProduct.priceMulti = price;
      console.log ('price multi', price);

      // update calculated price in the HTML

      thisProduct.priceElem.innerHTML = price;
      console.log ('actual price:', thisProduct.priceElem);

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

      app.cart.add (thisProduct.prepareCartProduct());
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
        console.log ('param id:', paramId);
        console.log ('param:', param);

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

  class AmountWidget {
    constructor (element) {
      const thisWidget = this;

      console.log ('amountWidget:', thisWidget);
      console.log ('constructor argument:', element);

      thisWidget.getElements (element);
      thisWidget.setValue (thisWidget.input.value);
      thisWidget.initActions ();

    }

    getElements (element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue (value) {

      const thisWidget = this;

      thisWidget.value = settings.amountWidget.defaultValue;

      const newValue = parseInt (value);

      /* TODO: Add validation */

      if (thisWidget.value !== newValue && !isNaN (newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {

        thisWidget.value = newValue;

      }

      thisWidget.input.value = thisWidget.value;

      thisWidget.announce ();

    }

    initActions () {

      const thisWidget = this;

      thisWidget.input.addEventListener ('change', function () {
        thisWidget.setValue (thisWidget.input.value);
      }),

      thisWidget.linkDecrease.addEventListener ('click', function (event) {

        event.preventDefault ();
        thisWidget.setValue (thisWidget.value -1);

      }),

      thisWidget.linkIncrease.addEventListener ('click', function (event) {

        event.preventDefault ();
        thisWidget.setValue (thisWidget.value + 1);

      });
    }

    announce () {
      const thisWidget = this;

      const event = new Event ('updated');
      thisWidget.element.dispatchEvent (event);

    }
  }

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
    }

    initActions () {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener ('click', function () {
        // console.log ('click');

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
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

    }
  }

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

    }

    getElements (element) {

      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector (select.cartProduct.amountWidget);
      console.log ('thisCartProduct.dom.amountWidget', thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector (select.cartProduct.price);
      console.log ('thisCartProduct.dom.price', thisCartProduct.dom.price);

      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector (select.cartProduct.edit);
      console.log ('thisCartProduct.dom.price', thisCartProduct.dom.edit);

      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector (select.cartProduct.remove);
      console.log ('thisCartProduct.dom.price', thisCartProduct.dom.remove);

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
  }


  const app = {

    initMenu: function () {
      const thisApp = this;
      // console.log ('thisAppData:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product (productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector (select.containerOf.cart);
      thisApp.cart = new Cart (cartElem);
    },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();

    },
  };

  app.init();

}
