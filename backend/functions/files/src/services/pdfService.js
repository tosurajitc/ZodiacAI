// backend/functions/files/src/services/pdfService.js
// PDF Generation Service for Kundli Reports - FIXED VERSION

const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');

/**
 * Generate Kundli PDF report
 * @param {Object} data - { birthDetails, chartData, userName }
 * @returns {Promise<Buffer>} PDF buffer
 */


// Enhanced PDF Service - Add to existing pdfService.js
// Location: backend/functions/files/src/services/pdfService.js
// ADD these functions to the existing file

const PDFDocument = require('pdfkit');

// NEW: Generate Shodashvarga Table Page
function addShodashvargaTable(doc, shodashvarga) {
  doc.addPage();
  doc.fontSize(16).text('Shodashvarga Table (16 Divisional Charts)', 50, 50);
  doc.moveDown();
  
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const charts = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
  
  let startY = 100;
  const colWidth = 45;
  
  // Header row
  doc.fontSize(8).text('Planet', 50, startY);
  charts.forEach((chart, i) => {
    doc.text(chart, 120 + (i * colWidth), startY);
  });
  
  startY += 20;
  
  // Planet rows
  planets.forEach((planet, rowIndex) => {
    const y = startY + (rowIndex * 20);
    doc.fontSize(8).text(planet, 50, y);
    
    if (shodashvarga[planet]) {
      charts.forEach((chart, colIndex) => {
        const chartData = shodashvarga[planet][chart];
        if (chartData) {
          doc.text(chartData.sign.substring(0, 3), 120 + (colIndex * colWidth), y);
        }
      });
    }
  });
}

// NEW: Generate House Analysis Page
function addHouseAnalysis(doc, houseAnalysis) {
  doc.addPage();
  doc.fontSize(16).text('House Analysis (12 Bhavas)', 50, 50);
  doc.moveDown();
  
  let y = 100;
  
  houseAnalysis.forEach((house, index) => {
    if (index > 0 && index % 4 === 0) {
      doc.addPage();
      y = 50;
    }
    
    doc.fontSize(11).fillColor('#4A148C').text(
      `${house.house_number}. ${house.house_name}`, 
      50, y
    );
    
    doc.fontSize(9).fillColor('#000000')
       .text(`Sign: ${house.sign_in_house}`, 60, y + 15)
       .text(`Lord: ${house.house_lord} in ${house.lord_placement.description}`, 60, y + 30)
       .text(`Represents: ${house.represents}`, 60, y + 45);
    
    y += 80;
  });
}

// NEW: Generate Dasha Timeline Page
function addDashaTimeline(doc, dashaData) {
  doc.addPage();
  doc.fontSize(16).text('Vimshottari Dasha Timeline', 50, 50);
  doc.moveDown();
  
  // Current Dasha
  if (dashaData.current) {
    doc.fontSize(12).fillColor('#6A1B9A').text('Current Dasha:', 50, 100);
    doc.fontSize(10).fillColor('#000000')
       .text(`Mahadasha: ${dashaData.current.mahadasha}`, 60, 120)
       .text(`Antardasha: ${dashaData.current.antardasha}`, 60, 135)
       .text(`Period: ${dashaData.current.start_date} to ${dashaData.current.end_date}`, 60, 150);
  }
  
  // Timeline summary (next 5 periods)
  if (dashaData.complete_timeline) {
    doc.fontSize(12).fillColor('#6A1B9A').text('Upcoming Mahadashas:', 50, 180);
    
    let y = 200;
    const timeline = dashaData.complete_timeline.mahadashas || [];
    timeline.slice(0, 5).forEach((period, index) => {
      doc.fontSize(9).fillColor('#000000')
         .text(`${index + 1}. ${period.planet}: ${period.start_date} - ${period.end_date}`, 60, y);
      y += 15;
    });
  }
}

// UPDATED: Main generateKundliPDF function
async function generateKundliPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Page 1: Basic Info (existing)
      doc.fontSize(20).text('Vedic Astrology Kundli', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Name: ${data.birthDetails.name}`);
      doc.text(`Date: ${data.birthDetails.dateOfBirth}`);
      doc.text(`Time: ${data.birthDetails.timeOfBirth}`);
      doc.text(`Place: ${data.birthDetails.placeOfBirth}`);
      doc.moveDown();
      
      // Planetary Positions (existing)
      doc.fontSize(14).text('Planetary Positions');
      if (data.chartData && data.chartData.planets) {
        data.chartData.planets.forEach(planet => {
          doc.fontSize(10).text(`${planet.name}: ${planet.sign} ${planet.degree}°`);
        });
      }
      
      // NEW: Add Shodashvarga Table
      if (data.shodashvarga) {
        addShodashvargaTable(doc, data.shodashvarga);
      }
      
      // NEW: Add House Analysis
      if (data.houseAnalysis) {
        addHouseAnalysis(doc, data.houseAnalysis);
      }
      
      // NEW: Add Dasha Timeline
      if (data.dasha) {
        addDashaTimeline(doc, data.dasha);
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateKundliPDF };