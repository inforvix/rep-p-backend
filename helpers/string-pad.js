function leftPad(value, totalWidth, paddingChar) {
  if(value == undefined) { 
    value = ''}
  var length = totalWidth - value.length + 1;
  return Array(length).join(paddingChar || '0') + value;
};

function rightPad(value, totalWidth, paddingChar) {
  if(value == undefined) { 
    value = ''}
  var length = totalWidth - value.length + 1;
  return value + Array(length).join(paddingChar || '0');
};  

  module.exports = {leftPad, rightPad}