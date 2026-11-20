export function normalizeRegistrationIdentity(input: {firstName: string; lastName: string; middleName?: string; contactNumber?: string}) {
  const clean = (value: string) => value.trim().replace(/\s+/g, ' ');
  const firstName=clean(input.firstName), lastName=clean(input.lastName), middleName=clean(input.middleName || '');
  if (!firstName || !lastName || [firstName,lastName,middleName].some(value => value.length>50 || /[\u0000-\u001f\u007f]/.test(value))) throw new Error('Enter your first and last names, using up to 50 characters per name field.');
  const contactNumber=(input.contactNumber || '').trim().replace(/[\s()-]/g,'');
  if (contactNumber && !/^\+?[0-9]{7,15}$/.test(contactNumber)) throw new Error('Enter a valid contact number with 7–15 digits, or leave it blank.');
  const name=[firstName,middleName,lastName].filter(Boolean).join(' ');
  if (name.length>120) throw new Error('Your combined name must be 120 characters or fewer.');
  return {firstName,lastName,middleName,contactNumber,name};
}
