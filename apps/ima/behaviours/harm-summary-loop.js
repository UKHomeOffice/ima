
module.exports = superclass => class extends superclass {

    saveValues(req,res,next){
     //   console.log(req.sessionModel.get('harm-claim-countries'));
       // console.log(req.sessionModel.get('harm-claim-countries').length);
       console.log(req.sessionModel.get('harm-claim-countries'));
        console.log(req.sessionModel.get('sih-countries'));
        console.log(req.sessionModel.get('sih-countries').aggregatedValues.length);

        
      return super.saveValues(req,res,next)
    }
}
