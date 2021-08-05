export default function convertUserAttributeName(attr: string | undefined) {
  // the goal of this function is to convert a user attribute field name,
  // from the way OneLogin reports it as an application parameter property
  // to the way the JupiterOne userEntity records the same property
  // if the user attribute name is not a custom one, it's simple - don't change a thing
  // if the user attribute name is a custom one, convert from:
  // custom_attribute_customAttributeName
  // to:
  // customAttributes.customAttributeName'
  if (attr) {
    const regex = /custom_attribute_([a-zA-Z-_]+)/;
    const match = attr.match(regex);
    if (match) {
      const attrName = match[1];
      const decapFirstLetter =
        attrName[0].toLowerCase() + attrName.substring(1);
      //for most customer attribute names the following is enough
      const dstr = 'customAttributes.' + decapFirstLetter;
      //but in the case that a custom attribute name has an acronym embedded in it,
      //we have to detect multiple capital letters in a row and convert them to
      //true camelCase. For example, myLongAWSAttribute ==> myLongAwsAttribute
      return dstr.replace(/([A-Z]+)/g, function (a) {
        if (a.length > 2) {
          return (
            a[0] + a.substr(1, a.length - 2).toLowerCase() + a[a.length - 1]
          );
        } else {
          return a;
        }
      });
    } else {
      return attr;
    }
  } else {
    return undefined;
  }
}
