'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

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
  locale: 'en-US', // de-DE
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

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov);

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int);

  labelSumInterest.textContent = formatCur(
    interest,
    account.locale,
    account.currency
  );
  labelSumOut.textContent = formatCur(
    Math.abs(out),
    account.locale,
    account.currency
  );
  labelSumIn.textContent = formatCur(incomes, account.locale, account.currency);
};

const createUsernames = function (accs) {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const displayAlertMessage = function (heading, message) {
  alertEl.style.opacity = 100;
  if (heading === 'Error') {
    alertEl.classList.add('error');
  } else {
    alertEl.classList.add('success');
  }
  const alert = message;
  alertHeading.textContent = heading;
  alertMessage.textContent = alert;

  setTimeout(function () {
    alertEl.style.opacity = 0;
    alertEl.classList.remove('error');
    alertEl.classList.remove('success');
  }, 3000);
};

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);
  // Display balance
  calcDisplayBalance(acc);
  // Display summary
  calcDisplaySummary(acc);
};

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

// Event Handler
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTime();

    updateUI(currentAccount);
  } else {
    inputLoginUsername.value = inputLoginPin.value = '';
    loginAlertEl.style.opacity = 100;
    setTimeout(function () {
      loginAlertEl.style.opacity = 0;
    }, 2500);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const recieverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    recieverAcc &&
    currentAccount.balance >= amount &&
    recieverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    recieverAcc.movementsDates.push(new Date().toISOString());
    recieverAcc.movements.push(amount);

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
    displayAlertMessage('Error', `Account or Amount is not valid!`);
  }

  clearInterval(timer);
  timer = startLogOutTime();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
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
    displayAlertMessage('Error', 'Amount is not valid');
  }
  inputLoanAmount.value = '';
  clearInterval(timer);
  timer = startLogOutTime();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
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
    displayAlertMessage('Error', 'Username or PIN is incorrect');
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////

// const ingredients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );
// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 3000);

// const num = 3884764.23;
// const options = {
//   style: 'currency',
//   unit: 'mile-per-hour',
//   currency: 'EUR',
// };

// console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
// console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('Syria: ', new Intl.NumberFormat('ar-SY', options).format(num));
// LECTURES
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(Number(future));

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
// console.log(days1);
// const now = new Date();
// console.log(now);

// console.log(new Date('Sep 29 2023 21:39:39'));
// console.log(new Date('December 24, 2015'));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 19, 15, 23, 5));
// console.log(new Date(2037, 10, 33));

// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// console.log(new Date(2142282180000));

// console.log(Date.now());
// console.log(new Date(1696045654085));

// future.setFullYear(2040);
// console.log(future);
// console.log(2 ** 53 - 1);
// console.log(2 ** 53 + 1);
// console.log(2 ** 53 + 2);
// console.log(2 ** 53 + 3);
// console.log(2 ** 53 + 4);

// console.log(1482954395839685498645986719034n);

// console.log(10000n + 10000n);

// const huge = 1284328592487593485n;
// const num = 23;

// console.log(huge * BigInt(num));

// console.log(20n > 15);
// console.log(20n === 20);

// console.log(huge + ' is REALLY big');
// const diameter = 287_460_000_000;
// console.log(diameter);

// const priceCents = 345_99;
// console.log(priceCents);

// const transferFee1 = 15_00;
// const transferFee2 = 1_500;

// const PI = 3.14159;
// console.log(PI);

// console.log(Number('230000'));
// console.log(5 % 2);
// console.log(8 % 3);

// const isEven = n => n % 2 === 0;

// console.log(isEven(6));
// console.log(isEven(23));
// console.log(isEven(514));

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

// console.log(Math.sqrt(25));
// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));

// console.log(Math.max(5, 17, 23, 11, 2));
// console.log(Math.max(5, 17, '23', 11, 2));
// console.log(Math.max(5, 17, '23px', 11, 2));

// console.log(Math.min(5, 17, 23, 11, 2));

// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;

// // console.log(randomInt(10, 20));

// console.log(Math.trunc(23.3));

// console.log(Math.round(23.3));
// console.log(Math.round(23.9));

// console.log(Math.ceil(23.3));
// console.log(Math.ceil(23.9));

// console.log(Math.floor(23.9));
// console.log(Math.floor(23.9));

// console.log(Math.trunc(-23.9));
// console.log(Math.floor(-23.9));

// console.log((2.7).toFixed(0));
// console.log((2.7).toFixed(3));
// console.log(+(2.345).toFixed(2));

// console.log(23 === 23.0);
// console.log(0.1 + 0.2);

// console.log(Number('23'));
// console.log(+'23');

// console.log(Number.parseInt('30px', 10));
// console.log(Number.parseInt('e23', 10));

// console.log(Number.parseFloat(' 2.5rem'));
// console.log(Number.parseInt(' 2.5rem'));

// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20X'));
// console.log(Number.isNaN(23 / 0));

// console.log(Number.isFinite(20));
// console.log(Number.isFinite(+'20X'));
// console.log(Number.isFinite(23 / 0));

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));
// console.log(Number.isInteger(23 / 0));

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// let arr = ['a', 'b', 'c', 'd', 'e'];

// // SLICE
// console.log(arr.slice(2));
// console.log(arr.slice(2, 4));
// console.log(arr.slice(-2));
// console.log(arr.slice(-1));
// console.log(arr.slice(1, -2));
// console.log(arr.slice());
// console.log([...arr]);

// // SPLICE
// // console.log(arr.splice(2));
// console.log(arr.splice(-1));
// console.log(arr.splice(1, 2));
// console.log(arr);

// // REVERSE
// arr = ['a', 'b', 'c', 'd', 'e'];
// const arr2 = ['j', 'i', 'h', 'g', 'f'];
// console.log(arr2.reverse());
// console.log(arr2);

// // CONCAT
// const letters = arr.concat(arr2);
// console.log(letters);

// // JOIN
// console.log(letters.join(' - '));

// const arr = [23, 11, 64];
// console.log(arr[0]);
// console.log(arr.at(0));

// console.log(arr.at(-1));
// console.log('jonas'.at(-1));

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // for (const movement of movements) {
// for (const [i, movement] of movements.entries()) {
//   if (movement > 0) {
//     console.log(`Movement ${i + 1}: You deposited ${movement}`);
//   } else {
//     console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
//   }
// }

// console.log('---- FOREACH ----');
// movements.forEach((mov, i, arr) => {
//   if (mov > 0) {
//     console.log(`Movement ${i + 1}: You deposited ${mov}`);
//   } else {
//     console.log(`Movement ${i + 1}: You withdrew ${Math.abs(mov)}`);
//   }
// });

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach((value, key) => {
//   console.log(`${key}: ${value}`);
// });

// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// console.log(currenciesUnique);
// currenciesUnique.forEach(value => {
//   console.log(`${value}: ${value}`);
// });

///////////////////////////////////////
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

// const julia = [3, 5, 2, 12, 7];
// const kate = [4, 1, 15, 8, 3];

// const checkDogs = function (dogsJulia, dogsKate) {
//   const juliaNoCats = dogsJulia.slice(1, -2);
//   console.log(juliaNoCats);
//   const both = dogsKate.concat(juliaNoCats);
//   both.forEach((dog, i) => {
//     if (dog < 3) {
//       console.log(`Dog number ${i + 1} is still a puppy ${dog}`);
//     } else {
//       console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old`);
//     }
//   });
// };

// checkDogs(julia, kate);

// const eurToUsd = 1.1;

// const movementsUSD = movements.map(mov => mov * eurToUsd);

// console.log(movements);
// console.log(movementsUSD);

// const movementsUSDfor = [];
// for (const mov of movements) {
//   movementsUSDfor.push(mov * eurToUsd);
// }
// console.log(movementsUSDfor);

// const movementsDescriptions = movements.map((mov, i) => {
//   return `Movement ${i + 1}: You ${
//     mov > 0 ? 'deposited' : 'withdrew'
//   } ${Math.abs(mov)}`;
// });

// console.log(movementsDescriptions);

// const deposits = movements.filter(function (mov) {
//   return mov > 0;
// });
// console.log(deposits);

// const withdrawals = movements.filter(mov => {
//   return mov < 0;
// });

// console.log(withdrawals);

// console.log(movements);
// // const balance = movements.reduce((acc, mov, i) => {
// //   console.log(`Iteration ${i}: ${acc}`);
// //   return acc + mov;
// // }, 0);

// const balance = movements.reduce((acc, cur) => acc + cur, 0);
// console.log(balance);

// let balance2 = 0;
// for (const mov of movements) {
//   balance2 += mov;
// }
// console.log(balance2);

// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) {
//     return acc;
//   } else {
//     return mov;
//   }
// }, movements[0]);
// console.log(max);

///////////////////////////////////////
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

// const calcAverageHumanAge = function (ages) {
//   const humanAge = ages
//     .map(age => {
//       return age <= 2 ? 2 * age : 16 + age * 4;
//     })
//     .filter(age => {
//       if (age > 18) return age;
//     });
//   console.log(humanAge);
//   const average =
//     humanAge.reduce((acc, cur) => {
//       return (acc += cur);
//     }) / humanAge.length;
//   console.log(average);
// };

// calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

// const eurToUsd = 1.1;
// const totalDepositsUSD = movements
//   .filter(mov => mov > 0)
//   .map(mov => mov * eurToUsd)
//   .reduce((acc, mov) => acc + mov);
// console.log(totalDepositsUSD);

// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(movements);
// console.log(firstWithdrawal);

// console.log(accounts);

// const account = accounts.find(acc => acc.owner === 'Jessica Davis');

// console.log(account);

// console.log(movements);
// console.log(movements.includes(-130));

// const anyDeposits = movements.some(mov => mov > 5000);
// console.log(anyDeposits);

// console.log(movements.every(mov => mov > 0));

// const deposit = mov => mov > 0;

// const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
// console.log(arr.flat());
// const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
// console.log(arrDeep.flat(2));

// // const accountMovements = accounts.map(acc => acc.movements);
// // console.log(accountMovements);
// // const allMovements = accountMovements.flat();
// // console.log(allMovements);
// // const overallBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
// // console.log(overallBalance);

// const overallBalance = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance);

// const overallBalance2 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance2);

// const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
// console.log(owners.sort());

// console.log(movements);
// console.log(movements.sort());

// // movements.sort((a, b) => {
// //   if (a > b) return 1;
// //   if (b > a) return -1;
// // });
// movements.sort((a, b) => a - b);

// console.log(movements);
// movements.sort((a, b) => b - a);
// // movements.sort((a, b) => {
// //   if (a > b) return -1;
// //   if (b > a) return 1;
// // });

// console.log(movements);

// const arr = [1, 2, 3, 4, 5, 6, 7];
// const x = new Array(7);
// console.log(x);
// // x.fill(1);
// x.fill(1, 3, 5);
// console.log(x);
// arr.fill(23, 2, 6);
// console.log(arr);

// const arr2 = Array.from({ length: 7 }, () => 1);
// console.log(arr2);

// const z = Array.from({ length: 7 }, (_, i) => i + 1);
// console.log(z);

// console.log(Math.floor(Math.random() * 6) + 1);
// const dice = Array.from(
//   { length: 100 },
//   () => Math.floor(Math.random() * 6) + 1
// );
// console.log(dice);

// labelBalance.addEventListener('click', function () {
//   const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value'),
//     el => Number(el.textContent.replace('€', ''))
//   );
//   console.log(movementsUI);
// });

// Array Methods Practice

// 1.
// const bankDepositsSum = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((acc, mov) => acc + mov);
// console.log(bankDepositsSum);

// // 2.
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000).length;

// // const numDeposits1000 = accounts
// //   .flatMap(acc => acc.movements)
// //   .reduce((count, mov) => (mov >= 1000 ? count + 1 : count), 0);
// console.log(numDeposits1000);

// // 3.
// const { deposits, withdrawals } = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// console.log(deposits, withdrawals);

// // 4.
// // this is a nice title -> This Is a Nice Title
// const convertTitleCase = function (title) {
//   const exceptions = [
//     'a',
//     'an',
//     'and',
//     'the',
//     'but',
//     'or',
//     'on',
//     'in',
//     'with',
//     'is',
//   ];
//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word =>
//       exceptions.includes(word) ? word : word[0].toUpperCase() + word.slice(1)
//     )
//     .join(' ');
//   return titleCase;
// };

// console.log(convertTitleCase('this is a nice title'));
// console.log(convertTitleCase('this is a LONG title but not too long'));
// console.log(convertTitleCase('and here is another title with an EXAMPLE'));

///////////////////////////////////////
// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK 😀
*/
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// console.log(dogs);
// dogs.forEach(dog => {
//   dog.recommendedFood = Math.floor(dog.weight ** 0.75 * 28);
// });

// const dogOwner = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(dogOwner);
// console.log(
//   `Sarahs dog is eating too ${
//     dogOwner.curFood > dogOwner.recommendedFood ? 'much' : 'little'
//   }`
// );

// const ownersEatTooMuch = dogs
//   .filter(dog => dog.curFood > dog.recommendedFood)
//   .flatMap(dog => dog.owners);

// const ownersEatTooLittle = dogs
//   .filter(dog => dog.curFood < dog.recommendedFood)
//   .flatMap(dog => dog.owners);

// console.log(ownersEatTooLittle);
// console.log(ownersEatTooMuch);
// // 4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"

// console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too much!`);
// console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too litte!`);

// console.log(dogs.some(dog => dog.curFood === dog.recommendedFood));

// const eatingOkay = dog =>
//   dog.curFood > dog.recommendedFood * 0.9 &&
//   dog.curFood < dog.recommendedFood * 1.1;

// console.log(dogs.some(eatingOkay));

// const dogsEatingOkay = dogs.filter(eatingOkay);
// console.log(dogsEatingOkay);

// // 8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)
// const dogsSorted = dogs
//   .slice()
//   .sort((a, b) => a.recommendedFood - b.recommendedFood);

// console.log(dogsSorted);
