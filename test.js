const index = require('./index');
const fs = require('fs');
const path = './Dockerfile';

test('Creates Dockerfile', () => {
  // arrange
  index.figlet();
  // act
  fs.exists(path, (exist) => {
  // assert
    expect(exist).toBe.true();
    
  });
})