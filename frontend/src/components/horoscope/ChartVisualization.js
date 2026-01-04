import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Polygon, G } from 'react-native-svg';

const ChartVisualization = ({ chartData, size = 300 }) => {
  // Default chart data if none provided
  const defaultChartData = {
    houses: [
      { number: 1, sign: 'Aries', planets: ['Sun', 'Mercury'] },
      { number: 2, sign: 'Taurus', planets: [] },
      { number: 3, sign: 'Gemini', planets: ['Mars'] },
      { number: 4, sign: 'Cancer', planets: ['Moon'] },
      { number: 5, sign: 'Leo', planets: [] },
      { number: 6, sign: 'Virgo', planets: [] },
      { number: 7, sign: 'Libra', planets: ['Venus'] },
      { number: 8, sign: 'Scorpio', planets: [] },
      { number: 9, sign: 'Sagittarius', planets: ['Jupiter'] },
      { number: 10, sign: 'Capricorn', planets: [] },
      { number: 11, sign: 'Aquarius', planets: ['Saturn'] },
      { number: 12, sign: 'Pisces', planets: ['Rahu'] },
    ],
  };

  const data = chartData || defaultChartData;
  const center = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = size / 4;

  // Planet symbols mapping
  const planetSymbols = {
    Sun: '☉',
    Moon: '☽',
    Mars: '♂',
    Mercury: '☿',
    Jupiter: '♃',
    Venus: '♀',
    Saturn: '♄',
    Rahu: '☊',
    Ketu: '☋',
  };

  // Calculate house positions for North Indian style chart
  const getHouseCoordinates = (houseNumber) => {
    // North Indian chart layout (diamond shape with 12 divisions)
    const positions = {
      1: { x: center, y: 20, width: outerRadius * 0.7, height: outerRadius * 0.7 },
      2: { x: center + outerRadius * 0.5, y: center - outerRadius * 0.5, width: outerRadius * 0.5, height: outerRadius * 0.5 },
      3: { x: size - 20, y: center, width: outerRadius * 0.7, height: outerRadius * 0.7 },
      4: { x: center + outerRadius * 0.5, y: center + outerRadius * 0.5, width: outerRadius * 0.5, height: outerRadius * 0.5 },
      5: { x: center, y: size - 20, width: outerRadius * 0.7, height: outerRadius * 0.7 },
      6: { x: center - outerRadius * 0.5, y: center + outerRadius * 0.5, width: outerRadius * 0.5, height: outerRadius * 0.5 },
      7: { x: 20, y: center, width: outerRadius * 0.7, height: outerRadius * 0.7 },
      8: { x: center - outerRadius * 0.5, y: center - outerRadius * 0.5, width: outerRadius * 0.5, height: outerRadius * 0.5 },
      9: { x: center - outerRadius * 0.35, y: 20 + outerRadius * 0.35, width: outerRadius * 0.5, height: outerRadius * 0.5 },
      10: { x: center + outerRadius * 0.35, y: 20 + outerRadius * 0.35, width: outerRadius * 0.5, height: outerRadius * 0.5 },
      11: { x: center + outerRadius * 0.35, y: size - 20 - outerRadius * 0.35, width: outerRadius * 0.5, height: outerRadius * 0.5 },
      12: { x: center - outerRadius * 0.35, y: size - 20 - outerRadius * 0.35, width: outerRadius * 0.5, height: outerRadius * 0.5 },
    };
    return positions[houseNumber];
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Outer diamond border */}
        <Polygon
          points={`${center},10 ${size - 10},${center} ${center},${size - 10} 10,${center}`}
          fill="none"
          stroke="#667eea"
          strokeWidth="2"
        />

        {/* Inner diamond */}
        <Polygon
          points={`${center},${center - innerRadius} ${center + innerRadius},${center} ${center},${center + innerRadius} ${center - innerRadius},${center}`}
          fill="none"
          stroke="#667eea"
          strokeWidth="1"
        />

        {/* Diagonal lines to create 12 houses */}
        <Line x1={center} y1={10} x2={center} y2={size - 10} stroke="#667eea" strokeWidth="1" />
        <Line x1={10} y1={center} x2={size - 10} y2={center} stroke="#667eea" strokeWidth="1" />
        <Line x1={center - innerRadius} y1={center} x2={10} y2={10} stroke="#667eea" strokeWidth="1" />
        <Line x1={center + innerRadius} y1={center} x2={size - 10} y2={10} stroke="#667eea" strokeWidth="1" />
        <Line x1={center - innerRadius} y1={center} x2={10} y2={size - 10} stroke="#667eea" strokeWidth="1" />
        <Line x1={center + innerRadius} y1={center} x2={size - 10} y2={size - 10} stroke="#667eea" strokeWidth="1" />

        {/* House numbers and planets */}
        {data.houses.map((house) => {
          const pos = getHouseCoordinates(house.number);
          return (
            <G key={house.number}>
              {/* House number */}
              <SvgText
                x={pos.x}
                y={pos.y}
                fontSize="12"
                fontWeight="bold"
                fill="#667eea"
                textAnchor="middle"
              >
                {house.number}
              </SvgText>

              {/* Planets in house */}
              {house.planets.map((planet, idx) => (
                <SvgText
                  key={planet}
                  x={pos.x}
                  y={pos.y + 18 + idx * 16}
                  fontSize="14"
                  fill="#1f2937"
                  textAnchor="middle"
                >
                  {planetSymbols[planet] || planet.substring(0, 2)}
                </SvgText>
              ))}
            </G>
          );
        })}

        {/* Center label */}
        <SvgText
          x={center}
          y={center + 5}
          fontSize="10"
          fill="#9ca3af"
          textAnchor="middle"
        >
          Rasi
        </SvgText>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Planet Symbols:</Text>
        <View style={styles.legendGrid}>
          {Object.entries(planetSymbols).map(([planet, symbol]) => (
            <View key={planet} style={styles.legendItem}>
              <Text style={styles.legendSymbol}>{symbol}</Text>
              <Text style={styles.legendText}>{planet}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  legendSymbol: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  legendText: {
    fontSize: 13,
    color: '#6b7280',
  },
});

export default ChartVisualization;
