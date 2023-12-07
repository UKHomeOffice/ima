'use strict';


const init = function init() {
   
   
    document.getElementById("country-1").addEventListener("change", function(e,req){
  
     // fetch('http://localhost:8080/ima/harm-claim-countries');
      //alert("Do you want to change country")
     $.ajax({
      type: "GET",
      url: 'http://localhost:8080/ima/harm-claim-countries'
    });
    //    req.sessionModel.set('harm-claim-country',e.target.value);
     //   alert("Do you want to change country")
    })
 
};

module.exports = {
  init: init
};
