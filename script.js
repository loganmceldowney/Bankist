'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data
const account1 = {
  owner: 'Logan McEldowney',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-11-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2023-09-27T10:51:36.194Z',
    '2023-09-28T10:51:36.929Z',
    '2023-09-29T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2022-11-01T13:15:33.035Z',
    '2022-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-07-26T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const alertEl = document.querySelector('.alert');
const alertMessage = document.querySelector('.alert-message');
const alertHeading = document.querySelector('.alert-heading');
const loginAlertEl = document.querySelector('.login-alert');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// formatMovementDate Function
const formatMovementDate = function (date, locale) {
  // Calculating days passed
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  // Returning different strings based on how long ago the date was
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

/////////////////////////////////////////////////
// formatCur Function
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

/////////////////////////////////////////////////
// displayMovements Function
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // Getting the movements from the account
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  // For each movement
  movs.forEach((mov, i) => {
    // Determine the type
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // Get the date and display the date
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // Get the formatted currency
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    // Create the html
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;

    // Insert the above html into the container that has movements
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/////////////////////////////////////////////////
// calcDisplayBalance Function
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

/////////////////////////////////////////////////
// calcDisplaySummary Function
const calcDisplaySummary = function (account) {
  // Getting the deposits
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);

  // Getting the withdrawals
  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov);

  // Getting the interest
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int);

  // Updating interest
  labelSumInterest.textContent = formatCur(
    interest,
    account.locale,
    account.currency
  );

  // Updating withdrawals
  labelSumOut.textContent = formatCur(
    Math.abs(out),
    account.locale,
    account.currency
  );
  // Updating deposits
  labelSumIn.textContent = formatCur(incomes, account.locale, account.currency);
};

/////////////////////////////////////////////////
// createUsernames Function
const createUsernames = function (accs) {
  // Creates a username from each account based on the owner
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

/////////////////////////////////////////////////
// displayAlertMessage Function
const displayAlertMessage = function (heading, message) {
  // Displaying the alert
  alertEl.style.opacity = 100;
  if (heading === 'Error') {
    alertEl.classList.add('error');
  } else {
    alertEl.classList.add('success');
  }

  // Updating the message for the alert
  const alert = message;
  alertHeading.textContent = heading;
  alertMessage.textContent = alert;

  // Removing the alert after 3 seconds
  setTimeout(function () {
    alertEl.style.opacity = 0;
    alertEl.classList.remove('error');
    alertEl.classList.remove('success');
  }, 3000);
};

/////////////////////////////////////////////////
// updateUI Function
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);
  // Display balance
  calcDisplayBalance(acc);
  // Display summary
  calcDisplaySummary(acc);
};

/////////////////////////////////////////////////
// startLogOutTime Function
const startLogOutTime = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };
  // Set time to 10 minutes
  let time = 600;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// Event Handlers

/////////////////////////////////////////////////
// LOGIN
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  // Find the current account based on the accounts username and the value
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  // If current accounts pin equals the users input
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    // Create the date string
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    // Update the date on the UI
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // If timer exists, clear it, then start a new one
    if (timer) clearInterval(timer);
    timer = startLogOutTime();

    // Update the UI
    updateUI(currentAccount);
  } else {
    // Display error alert
    inputLoginUsername.value = inputLoginPin.value = '';
    loginAlertEl.style.opacity = 100;
    setTimeout(function () {
      loginAlertEl.style.opacity = 0;
    }, 2500);
  }
});

/////////////////////////////////////////////////
// TRANSFER
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  // Getting the amount and the reciever account from the input
  const amount = Number(inputTransferAmount.value);
  const recieverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  // Checking conditionals for a transfer
  if (
    amount > 0 &&
    recieverAcc &&
    currentAccount.balance >= amount &&
    recieverAcc?.username !== currentAccount.username
  ) {
    // Add that movement and date to the current account
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    // Add that movement and date to the reciever account
    recieverAcc.movementsDates.push(new Date().toISOString());
    recieverAcc.movements.push(amount);

    // Display success message
    displayAlertMessage(
      'Success',
      `${formatCur(
        amount,
        currentAccount.locale,
        currentAccount.currency
      )} has been transferred to ${recieverAcc.owner}!`
    );

    updateUI(currentAccount);
  } else {
    // Display error message
    displayAlertMessage('Error', `Account or Amount is not valid!`);
  }

  // Reset the timer
  clearInterval(timer);
  timer = startLogOutTime();
});

/////////////////////////////////////////////////
// LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  // Get amount from user
  const amount = Math.floor(inputLoanAmount.value);

  // Checking conditonals for a loan
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Waiting 1.75 seconds
    setTimeout(function () {
      // Adding that movement and date to the current account
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);

      // Display success message
      displayAlertMessage(
        'Success',
        `Loan of ${formatCur(
          amount,
          currentAccount.locale,
          currentAccount.currency
        )} has been added to your account!`
      );
    }, 1750);
  } else {
    // Display error message
    displayAlertMessage('Error', 'Amount is not valid');
  }

  // Clear value and reset timer
  inputLoanAmount.value = '';
  clearInterval(timer);
  timer = startLogOutTime();
});

/////////////////////////////////////////////////
// CLOSE ACCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  // Checking conditonals for closing an account
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    // Finding the index of the account
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    // Delete account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  } else {
    // Display error message
    displayAlertMessage('Error', 'Username or PIN is incorrect');
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

/////////////////////////////////////////////////
// SORT MOVEMENTS
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

let sorted = false;
createUsernames(accounts);
