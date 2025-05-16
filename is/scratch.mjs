
// Scratch script for testing and experimentation

// Example async function
async function testFunction() {
  try {
    // Sample async operation
    const result = await Promise.resolve('Test successful');
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example class
class ScratchTest {
  constructor() {
    this.data = [];
  }

  addItem(item) {
    this.data.push(item);
  }

  getItems() {
    return this.data;
  }
}

// Example usage
const test = new ScratchTest();
test.addItem('Hello');
test.addItem('World');
console.log(test.getItems());

// Run async test
testFunction();

// Export for potential module usage
export { ScratchTest, testFunction };
