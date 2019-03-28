const path = require('path');
const child = require('child_process');

beforeEach(() => {
  exec = path.join(__dirname, '..', 'dockerize/bin/dockerize-it');
  // stdio is used to configure the pipes the parent and child
  proc = child.spawn(exec, ({stdio: 'pipe'}))
  console.log(exec);
});
test('Prints help menu', () => {
  // act
 proc.stdout.once('data', function(output) {
   // assert
   expect(output.toString('utf-8')).toContain('🐳');
   done();
 })
  });
