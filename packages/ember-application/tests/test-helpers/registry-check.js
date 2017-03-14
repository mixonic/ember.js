export function verifyRegistration(owner, fullName) {
  ok(owner.resolveRegistration(fullName), `has registration: ${fullName}`);
}

/* TODO: This uses the registry API directly, should be rewritten to
 * use the owner or to use the glimmer registry. */
export function verifyInjection(owner, fullName, property, injectionName) {
  let registry = owner.__registry__;
  let injections;

  if (fullName.indexOf(':') === -1) {
    injections = registry.getTypeInjections(fullName);
  } else {
    injections = registry.getInjections(fullName);
  }

  let normalizedName = injectionName;
  let hasInjection = false;
  let injection;

  for (let i = 0, l = injections.length; i < l; i++) {
    injection = injections[i];
    if (injection.property === property && injection.fullName === normalizedName) {
      hasInjection = true;
      break;
    }
  }

  ok(hasInjection, `has injection: ${fullName}.${property} = ${injectionName}`);
}
