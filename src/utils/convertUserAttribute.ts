export default function convertUserAttribute(attr: string | undefined) {
  // if the user attribute name is a standard one, don't change a thing
  // if the user attribute name is a custom one, convert from:
  // custom_attribute_customAttributeName
  // to:
  // customAttributes.customAttributeName'
  console.log(`aws attr was : ${attr}`);
  //cheating for now because I'm having pain with camelcase conversions of things like custom_attribute_SuperLongAWSRoleArn
  return 'customAttributes.superLongAwsRoleArn';
  if (attr) {
    const regex = /custom_attribute_([a-zA-Z-_]+)/;
    const match = attr.match(regex);
    if (match) {
      const attrName = match[1];
      const decapFirstLetter =
        attrName[0].toLowerCase() + attrName.substring(1);
      return 'customAttributes.' + decapFirstLetter;
    } else {
      return attr;
    }
  } else {
    return undefined;
  }
}
