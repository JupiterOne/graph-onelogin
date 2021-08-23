import convertUserAttributeName from './convertUserAttributeName';

test('should return non-custom attribute unchanged', () => {
  expect(convertUserAttributeName('email')).toMatch('email');
});

test('should convert custom attribute properly', () => {
  expect(
    convertUserAttributeName('custom_attribute_customAttributeName'),
  ).toMatch('customAttributes.customAttributeName');
});

test('should custom attribute with acronym properly', () => {
  expect(
    convertUserAttributeName('custom_attribute_myLongAWSRoleField'),
  ).toMatch('customAttributes.myLongAwsRoleField');
});
