'use strict';


const init = function init() {
   
    document.getElementById("country-1").addEventListener("change", function(e){
        return e.target.value
      })
  
};

module.exports = {
  init: init
};
