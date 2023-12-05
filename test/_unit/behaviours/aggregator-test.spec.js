const AggregatorBehaviour = require('../../../apps/ima/behaviours/aggregator-save-update');
const Model = require('hof').model;

describe('aggregator behaviour', () => {
  class Base {
  }

  let behaviour;
  let Behaviour;
  let req;
  let res;

  describe('aggregator', () => {
    let superGetValuesStub;
    let superLocalsStub;

    beforeEach(() => {
      req = reqres.req();
      res = reqres.res();

      req.sessionModel = new Model({});

      req.form.options = {
        aggregateFrom: ['family-member-full-name',
          'family-member-relation',
          'family-member-dob',
          'family-member-nationality',
          'uk-immigration-status',
          'immigration-status-other',
          'reference-number-option',
          'uan-detail',
          'ho-number-detail',
          'human-rights-claim-details'],
        aggregateTo: 'family-members',
        addStep: 'human-rights-family',
        route: '/human-rights-claim',
        addAnotherLinkText: 'family member',
        fieldsConfig: {
          'family-member-full-name': {},
          'family-member-relation': {},
          'family-member-dob': {},
          'family-member-nationality': {},
          'uk-immigration-status': {},
          'immigration-status-other': {},
          'reference-number-option': {},
          'uan-detail': {},
          'ho-number-detail': {},
          'human-rights-claim-details': {}
        }
      };
      req.baseUrl = '/test';

      superGetValuesStub = sinon.stub();
      superLocalsStub = sinon.stub();
      Base.prototype.getValues = superGetValuesStub;
      Base.prototype.locals = superLocalsStub;
      next = sinon.stub();

      Behaviour = AggregatorBehaviour(Base);
      behaviour = new Behaviour(req.form.options);
      behaviour.confirmStep = '/confirm';
    });

    describe('delete item', () => {
      beforeEach(() => {
        req.sessionModel.set('family-members', {
          aggregatedValues: [
            { itemTitle: 'Family Member 1', fields: [] }
          ]
        });
        req.params.id = '0';
      });

      it('deletes the item with the given id when the action is delete and an id is provide', () => {
        behaviour.deleteItem(req, res);
        req.sessionModel.get('family-members').aggregatedValues.should.eql([]);
      });

      it('redirects back to human rights claim step if no records exist on human rights family summary', () => {
        behaviour.deleteItem(req, res);
        req.sessionModel.get('family-members').aggregatedValues.should.eql([]);
        res.redirect.should.be.calledOnceWithExactly('/test/human-rights-claim');
      });

      it('does not redirect to the human rights claim step if records exist on human rights family summary', () => {
        req.form.options.route = '/human-rights-family-summary';
        req.sessionModel.set('family-members', {
          aggregatedValues: [
            { itemTitle: 'Family Member 1', fields: [] },
            { itemTitle: 'Family Member 2', fields: [] }
          ]
        });
        behaviour.deleteItem(req, res);
        req.sessionModel.get('family-members').aggregatedValues.should.eql(
          [{ itemTitle: 'Family Member 2', fields: [] }]
        );
        res.redirect.should.be.calledOnceWithExactly('/test/human-rights-family-summary');
      });

      it('does not redirect to human rights claim step if current screen is not human rights family summary', () => {
        req.form.options = {
          aggregateFrom: ['input-field',
            'date-field',
            'dropdown-field',
            'radio-field',
            'textarea-field'],
          aggregateTo: 'details-test',
          addStep: 'form-details',
          route: '/form-details-summary',
          addAnotherLinkText: 'test-detail',
          fieldsConfig: {
            'input-field': {},
            'date-field': {},
            'dropdown-field': {},
            'radio-field': {},
            'textarea-field': {}
          }
        };
        req.sessionModel.set('details-test', {
          aggregatedValues: [
            { itemTitle: 'Test Record 1', fields: [] }
          ]
        });
        behaviour.deleteItem(req, res);
        req.sessionModel.get('details-test').aggregatedValues.should.eql([]);
        res.redirect.should.not.be.calledWith('/test/human-rights-claim');
      });
    });
  });
});
