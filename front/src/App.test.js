test('should pass basic math test', () => {
  expect(2 + 2).toBe(4);
});

test('should pass string test', () => {
  expect('hello world').toContain('world');
});

test('should pass array test', () => {
  const arr = [1, 2, 3];
  expect(arr).toHaveLength(3);
});