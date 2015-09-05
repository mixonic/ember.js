/**
@module ember
@submodule ember-templates
*/

/**
   Use the `{{hash}}` helper to create a hash to pass as an option to your
   components. This is specially useful for contextual components where you can
   just yield a hash:

   ```handlebars
   {{yield (hash
      my-button=(component 'awesome-button' value=buttonValue)
      my-input=(component 'awesome-input' maxlength=inputMaxlength)
   )}}
   ```

   @method hash
   @for Ember.Templates.helpers
   @param {Object} options
   @return {Object} Hash
   @public
 */

export default function hashHelper(params, hash, options) {
  return hash;
}
