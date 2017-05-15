
const cssProps = (() => {
  const privateData = {};

  privateData.usedPrefix = 'darkyndyVideoPreview';

  const service = {};

  /**
   * @description Get property name
   *   This is used to add prefix for each property so will not break YouTube UI
   * @param {String} propr - property to be prefixed
   */
  service.getProprName = (propr) => {
    return `${privateData.usedPrefix}-${propr}`;
  };

  return service;
})();
