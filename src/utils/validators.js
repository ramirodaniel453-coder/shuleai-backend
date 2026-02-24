const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^(\+254|0)[7][0-9]{8}$/;
  return re.test(phone);
};

const validateIdNumber = (id) => {
  const re = /^[0-9]{7,8}$/;
  return re.test(id);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

const validateFutureDate = (date) => {
  return validateDate(date) && new Date(date) > new Date();
};

const validatePastDate = (date) => {
  return validateDate(date) && new Date(date) < new Date();
};

const validateAge = (birthDate, minAge = 3, maxAge = 100) => {
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  return age >= minAge && age <= maxAge;
};

const validateScore = (score, max = 100) => {
  return score >= 0 && score <= max;
};

const validateClass = (className, validClasses) => {
  return validClasses.includes(className);
};

const validateStream = (stream, validStreams) => {
  return validStreams.includes(stream);
};

module.exports = {
  validateEmail,
  validatePhone,
  validateIdNumber,
  validatePassword,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateAge,
  validateScore,
  validateClass,
  validateStream
};