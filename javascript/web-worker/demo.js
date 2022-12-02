

const createWebWorkerByFunction = (fn, name) =>  {
  const objectURL = URL.createObjectURL(new Blob([`(${fn.toString()})()`], { type: 'text/javascript'}), { name });
  return new Worker(objectURL);
}

const fibonacci = (num) => {
  if (num <= 1) return 1;

  return fibonacci(num - 1) + fibonacci(num - 2);
}

function calculateFibonacci() {
  const fibonacci = (num) => {
    if (num <= 1) return 1;
  
    return fibonacci(num - 1) + fibonacci(num - 2);
  }
  self.onmessage = (event) => {
    console.log('run in webworker');
    self.postMessage(fibonacci(event.data));
  }
}

const fibonacciWorker = createWebWorkerByFunction(calculateFibonacci, 'fibonacciWorker');


const calculateWithWebWorker = () => {
  fibonacciWorker.postMessage(40);
  fibonacciWorker.onmessage = (event) => {
    console.log(event.data);
  }
}

const calculate = () => {
  console.log(fibonacci(40));
}

