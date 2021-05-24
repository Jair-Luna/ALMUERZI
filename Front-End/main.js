//meals list array//
let mealsState = [];
let user = {};
let ruta = 'login';

//Change plaintext to HTML element//
const stringToHTML = (string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, 'text/html');

  return doc.body.firstChild;
};

//List meals items from database//
const renderItem = (item) => {
  const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`);

  element.addEventListener('click', () => {
    const mealsList = document.getElementById('meals-list');

    Array.from(mealsList.children).forEach((x) =>
      x.classList.remove('selected')
    );

    element.classList.add('selected');
    const mealsIdInput = document.getElementById('meals-id');
    mealsIdInput.value = item._id;
  });

  return element;
};

//List orders items from database//
const renderOrder = (order, meals) => {
  const meal = meals.find((meal) => meal._id === order.meal_id);
  const element = stringToHTML(
    `<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`
  );

  return element;
};

const initializeForm = () => {
  const orderForm = document.getElementById('order');

  //Submit button functions//
  orderForm.onsubmit = (e) => {
    e.preventDefault();
    const submit = document.getElementById('submit');
    submit.setAttribute('disabled', true);
    const mealID = document.getElementById('meals-id');
    const mealIdValue = mealID.value;

    if (!mealIdValue) {
      alert('Debe seleccionar un plato');
      submit.removeAttribute('disabled');
      return;
    }

    const order = {
      meal_id: mealIdValue,
      user_id: user.email,
    };

    const token2 = localStorage.getItem('token');

    //Refresh orders list//
    fetch('https://server2-jair-luna.vercel.app/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        athorization: token2,
      },
      body: JSON.stringify(order),
    })
      .then((x) => x.json())
      .then((respuesta) => {
        const renderedOrder = renderOrder(respuesta, mealsState);
        const ordersList = document.getElementById('orders-list');
        ordersList.appendChild(renderedOrder);
        submit.removeAttribute('disabled');
      });
  };
};

const initializeData = () => {
  //Get meals list from database//
  fetch('https://server2-jair-luna.vercel.app/api/meals')
    .then((response) => response.json())
    .then((data) => {
      mealsState = data;
      const mealsList = document.getElementById('meals-list');
      const submit = document.getElementById('submit');
      const listItems = data.map(renderItem);
      mealsList.removeChild(mealsList.firstElementChild);
      listItems.forEach((element) => mealsList.appendChild(element));
      submit.removeAttribute('disabled');

      //Get orders from database//
      fetch('https://server2-jair-luna.vercel.app/api/orders')
        .then((response) => response.json())
        .then((ordersData) => {
          const ordersList = document.getElementById('orders-list');
          const listOrders = ordersData.map((orderData) =>
            renderOrder(orderData, data)
          );
          ordersList.removeChild(ordersList.firstElementChild);
          listOrders.forEach((element) => ordersList.appendChild(element));
        });
    });
};

const renderApp = () => {
  const token = localStorage.getItem('token');
  if (token) {
    user = JSON.parse(localStorage.getItem('user'));
    return renderOrders();
  }
  renderLogin();
};

//Shows login template and get the inputs value to Log into the app
const renderLogin = () => {
  const loginTemplate = document.getElementById('login-template');
  document.getElementById('app').innerHTML = loginTemplate.innerHTML;

  const loginForm = document.getElementById('login-form');
  loginForm.onsubmit = (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('https://server2-jair-luna.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((x) => x.json())
      .then((respuesta) => {
        localStorage.setItem('token', respuesta.token);
        ruta = 'orders';
        return respuesta.token;
      })
      .then((token) => {
        return fetch('https://server2-jair-luna.vercel.app/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            athorization: token,
          },
        });
      })
      .then((x) => x.json())
      .then((fetchedUser) => {
        localStorage.setItem('user', JSON.stringify(fetchedUser.email));
        user = fetchedUser;
        renderOrders();
      });
  };

  const registerButton = document.getElementById('register-btn');
  const overlay = document.getElementById('overlay');
  const popup = document.getElementById('popup');
  const exit = document.getElementById('exit-register');

  registerButton.addEventListener('click', function () {
    overlay.classList.add('active');
    renderRegister();
  });

  exit.addEventListener('click', function () {
    overlay.classList.remove('active');
  });
};

//Shows register popup, register a new user
const renderRegister = () => {
  const registerForm = document.getElementById('register-form');

  registerForm.onsubmit = (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreR').value;
    const apellido = document.getElementById('apellidoR').value;
    const email = document.getElementById('emailR').value;
    const password = document.getElementById('passwordR').value;

    const user = {
      nombre: nombre,
      apellido: apellido,
      email: email,
      password: password,
    };

    fetch('https://server2-jair-luna.vercel.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    }).then((x) => x.json());
    alert('Now you have signed up, Log in with your new creadentials');
    renderLogin();
  };
};

const renderOrders = () => {
  const ordersView = document.getElementById('orders-view');
  document.getElementById('app').innerHTML = ordersView.innerHTML;

  initializeForm();
  initializeData();

  const logOutbtn = document.getElementById('logOut');
  logOutbtn.addEventListener('click', logOut);
};

//Close session
const logOut = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  alert('Logging out. Press Ok to continue');
  renderLogin();
};

//Call functions//
window.onload = () => {
  renderApp();
};
