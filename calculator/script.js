let currentOperand = 0;
let previousOperand = null;
let previousOperandDisplay = '';
let operand = null;
let lastInputIsOperand = false;
let addDeci = false;
let deciCounter = 10;
let deciLength = 0;
let modifyCurrent = true;
let prevDeciLength = 0;

const addDeciNum = () => {
  addDeci = true;
};

const allClear = () => {
  currentOperand = 0;
  previousOperand = null;
  previousOperandDisplay = '';
  operand = null;
  lastInputIsOperand = false;
  prevDeciLength = 0;
  resetInput();
  display();
};

const resetInput = () => {
  addDeci = false;
  deciCounter = 10;
  prevDeciLength = deciLength;
  deciLength = 0;
};

const deleteInput = () => {
  if (modifyCurrent == false) {
    return;
  }

  if (addDeci) {
    let result = currentOperand.toString();
    result = result.split('');
    result = Number(result[result.length - 1]);
    result = (result / deciCounter) * 10;
    result = result.toFixed(deciLength);
    result = Number(result);
    currentOperand = currentOperand - result;
    currentOperand = currentOperand.toFixed(deciLength - 1);
    currentOperand = Number(currentOperand);

    deciLength--;
    deciCounter = deciCounter / 10;

    if (deciLength == 0) {
      addDeci = false;
    }
  } else {
    let result = currentOperand.toString();
    result = result.split('');
    let minus = result[result.length - 1];
    currentOperand = currentOperand - Number(minus);
    currentOperand = currentOperand / 10;
  }

  display();
};

const display = () => {
  document.getElementById('cur').innerHTML = currentOperand;
  document.getElementById('prev').innerHTML = previousOperandDisplay;
};

const input = (val) => {
  if (modifyCurrent == false) {
    currentOperand = 0;
    modifyCurrent = true;
  }

  if (addDeci) {
    currentOperand = currentOperand + val / deciCounter;
    deciLength++;
    currentOperand = currentOperand.toFixed(deciLength);
    currentOperand = Number(currentOperand);
    deciCounter = deciCounter * 10;
  } else {
    currentOperand = currentOperand * 10 + val;
  }
  lastInputIsOperand = false;
  display();
};

const operandInput = (val) => {
  if (lastInputIsOperand) {
    operand = val;
    previousOperandDisplay = previousOperand + ' ' + operand;
    currentOperand = 0;
    display();
    return;
  }

  if (previousOperand != null && operand != null) {
    compute();
  }
  //gggg
  resetInput();
  previousOperand = currentOperand;
  operand = val;
  previousOperandDisplay = previousOperand + ' ' + operand;
  currentOperand = 0;

  lastInputIsOperand = true;

  display();
};

const compute = () => {
  if (operand == null) {
    return;
  }
  let result;
  switch (operand) {
    case '+':
      result = previousOperand + currentOperand;
      break;
    case '-':
      result = previousOperand - currentOperand;
      break;
    case '*':
      result = previousOperand * currentOperand;
      break;
    case '/':
      result = previousOperand / currentOperand;
      break;
  }

  currentOperand = result;

  console.log(prevDeciLength);
  console.log(deciLength);

  if (deciLength > prevDeciLength) {
    currentOperand = currentOperand.toFixed(deciLength);
  } else {
    currentOperand = currentOperand.toFixed(prevDeciLength);
  }

  currentOperand = Number(currentOperand);
  operand = null;
  previousOperand = result;

  previousOperandDisplay = '';
  lastInputIsOperand = false;
  modifyCurrent = false;

  display();
  resetInput();
};
