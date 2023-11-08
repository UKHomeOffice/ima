
module.exports = superclass => class extends superclass {
    getAggregateArray(req) {
      return req.sessionModel.get(req.form.options.aggregateTo).aggregatedValues;
    }
  
    setAggregateArray(req, value) {
      req.sessionModel.set(req.form.options.aggregateTo, { aggregatedValues: value });
    }
  
    locals(req, res) {
      const items = this.getAggregateArray(req);
      const superLocals = super.locals(req, res);
  
      if (items[req.params.id]) {
        return Object.assign({}, superLocals, {
          [req.form.options.itemTitle]: items[req.params.id].itemTitle
        });
      }
      return superLocals;
    }
  
    saveValues(req, res, next) {
      const id = req.params.id;
      const items = this.getAggregateArray(req).filter((element, index) => index !== parseInt(id, 10));
      this.setAggregateArray(req, items);
  
      return super.saveValues(req, res, next);
    }
  };
  