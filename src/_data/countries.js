// Country metadata for the blogs page
// Reads from countriesData.json (editable via Decap CMS)

const countriesData = require('./countriesData.json');

// Build mapping object from JSON array
const mapping = {};
countriesData.countries.forEach(country => {
  mapping[country.name] = country;
});

module.exports = {
  mapping,

  getISO(countryName) {
    return this.mapping[countryName]?.iso || "";
  },

  getFlag(countryName) {
    return this.mapping[countryName]?.flag || "🌍";
  },

  getName(countryName) {
    return this.mapping[countryName]?.name || countryName;
  },

  getMapX(countryName) {
    return this.mapping[countryName]?.mapX || 500;
  },

  getMapY(countryName) {
    return this.mapping[countryName]?.mapY || 250;
  },

  getAllCountries() {
    return countriesData.countries;
  }
};
