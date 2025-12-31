// Database Migration - Add Comprehensive Kundli Fields
// Location: backend/migrations/YYYYMMDDHHMMSS-add-comprehensive-kundli-fields.js
// Run with: npx sequelize-cli db:migrate

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('birth_details', 'shodashvarga_table', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'All 16 divisional chart positions for each planet (D1-D60)'
    });

    await queryInterface.addColumn('birth_details', 'house_analysis', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Analysis of all 12 houses with lords and placements'
    });

    await queryInterface.addColumn('birth_details', 'dasha_predictions', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Basic dasha predictions (free tier)'
    });

    await queryInterface.addColumn('birth_details', 'dasha_interpretations', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'AI-generated dasha interpretations (paid tier)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('birth_details', 'shodashvarga_table');
    await queryInterface.removeColumn('birth_details', 'house_analysis');
    await queryInterface.removeColumn('birth_details', 'dasha_predictions');
    await queryInterface.removeColumn('birth_details', 'dasha_interpretations');
  }
};