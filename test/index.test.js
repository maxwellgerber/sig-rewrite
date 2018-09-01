
require('should');
const sigRewrite = require('..');

describe('#sigRewrite', () => {
  it('is a function', () => {
    sigRewrite.should.be.a.Function();
  });

  it('Returns a function', () => {
    const wrapped = sigRewrite(() => {}, { toOptions: true });
    wrapped.should.be.a.Function();
  });

  describe('Failure modes', () => {
    const noop = () => {};

    it('throws an error if first argument is not a function', () => {
      (() => sigRewrite())
        .should.throw('First argument must be a function');
    });

    it('throws an error if no options are specified', () => {
      (() => sigRewrite(noop, {}))
        .should.throw('sig-rewrite requires one of: { toOptions, toBuilderPattern, defaults } to be specified');
    });

    it('throws an error if toOptions is true and toBuilderPattern is true', () => {
      (() => sigRewrite(noop, { toOptions: true, toBuilderPattern: true }))
        .should.throw('full toOptions and builder pattern are not compatible');
    });

    it('throws an error if builderTemplate is not a function', () => {
      (() => sigRewrite(noop, { toBuilderPattern: true, builderTemplate: 'asdf' }))
        .should.throw('builderTemplate must be a function');
    });

    it('throws an error if builderTemplate is specified but toBuilderPattern is falsy', () => {
      const opts = {
        defaults: {},
        builderTemplate: () => {},
      };

      (() => sigRewrite(noop, opts))
        .should.throw('Specifying builderTemplate when toBuilderPattern is not true is invalid');
    });
  });
});
