# astrology-engine/calculations/planetary_positions.py
# Detailed Planetary Position Calculations and Analysis

import swisseph as swe
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import math

class PlanetaryPositions:
    """
    Calculate detailed planetary positions, strengths, aspects,
    combustion, exaltation, debilitation, and special combinations.
    """
    
    # Planet strength levels
    EXALTATION = {
        'Sun': {'sign': 'Aries', 'degree': 10},
        'Moon': {'sign': 'Taurus', 'degree': 3},
        'Mars': {'sign': 'Capricorn', 'degree': 28},
        'Mercury': {'sign': 'Virgo', 'degree': 15},
        'Jupiter': {'sign': 'Cancer', 'degree': 5},
        'Venus': {'sign': 'Pisces', 'degree': 27},
        'Saturn': {'sign': 'Libra', 'degree': 20},
    }
    
    DEBILITATION = {
        'Sun': {'sign': 'Libra', 'degree': 10},
        'Moon': {'sign': 'Scorpio', 'degree': 3},
        'Mars': {'sign': 'Cancer', 'degree': 28},
        'Mercury': {'sign': 'Pisces', 'degree': 15},
        'Jupiter': {'sign': 'Capricorn', 'degree': 5},
        'Venus': {'sign': 'Virgo', 'degree': 27},
        'Saturn': {'sign': 'Aries', 'degree': 20},
    }
    
    # Own signs (Swakshetra)
    OWN_SIGNS = {
        'Sun': ['Leo'],
        'Moon': ['Cancer'],
        'Mars': ['Aries', 'Scorpio'],
        'Mercury': ['Gemini', 'Virgo'],
        'Jupiter': ['Sagittarius', 'Pisces'],
        'Venus': ['Taurus', 'Libra'],
        'Saturn': ['Capricorn', 'Aquarius'],
        'Rahu': ['Aquarius'],
        'Ketu': ['Scorpio'],
    }
    
    # Mooltrikona signs
    MOOLTRIKONA = {
        'Sun': 'Leo',
        'Moon': 'Taurus',
        'Mars': 'Aries',
        'Mercury': 'Virgo',
        'Jupiter': 'Sagittarius',
        'Venus': 'Libra',
        'Saturn': 'Aquarius',
    }
    
    # Friends, Enemies, Neutrals
    RELATIONSHIPS = {
        'Sun': {'friends': ['Moon', 'Mars', 'Jupiter'], 'enemies': ['Venus', 'Saturn'], 'neutral': ['Mercury']},
        'Moon': {'friends': ['Sun', 'Mercury'], 'enemies': [], 'neutral': ['Mars', 'Jupiter', 'Venus', 'Saturn']},
        'Mars': {'friends': ['Sun', 'Moon', 'Jupiter'], 'enemies': ['Mercury'], 'neutral': ['Venus', 'Saturn']},
        'Mercury': {'friends': ['Sun', 'Venus'], 'enemies': ['Moon'], 'neutral': ['Mars', 'Jupiter', 'Saturn']},
        'Jupiter': {'friends': ['Sun', 'Moon', 'Mars'], 'enemies': ['Mercury', 'Venus'], 'neutral': ['Saturn']},
        'Venus': {'friends': ['Mercury', 'Saturn'], 'enemies': ['Sun', 'Moon'], 'neutral': ['Mars', 'Jupiter']},
        'Saturn': {'friends': ['Mercury', 'Venus'], 'enemies': ['Sun', 'Moon', 'Mars'], 'neutral': ['Jupiter']},
    }
    
    SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    def __init__(self):
        """Initialize Planetary Positions Calculator"""
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    def get_planet_dignity(self, planet_name: str, sign: str, degree: float) -> Dict:
        """
        Determine planet's dignity (exalted, debilitated, own sign, etc.)
        
        Args:
            planet_name: Name of the planet
            sign: Current zodiac sign
            degree: Degree within the sign
        
        Returns:
            Dictionary with dignity information
        """
        dignity = {
            'status': 'neutral',
            'strength_percentage': 50,  # Base strength
            'description': 'Neutral position'
        }
        
        # Check exaltation
        if planet_name in self.EXALTATION:
            exalt_info = self.EXALTATION[planet_name]
            if sign == exalt_info['sign']:
                # Calculate exact exaltation strength
                degree_diff = abs(degree - exalt_info['degree'])
                if degree_diff <= 5:  # Within 5 degrees of exact exaltation
                    dignity['status'] = 'exalted'
                    dignity['strength_percentage'] = 100 - (degree_diff * 2)
                    dignity['description'] = f'Exalted in {sign}'
                else:
                    dignity['status'] = 'strong'
                    dignity['strength_percentage'] = 75
                    dignity['description'] = f'Strong in {sign} (exaltation sign)'
        
        # Check debilitation
        if planet_name in self.DEBILITATION:
            debil_info = self.DEBILITATION[planet_name]
            if sign == debil_info['sign']:
                degree_diff = abs(degree - debil_info['degree'])
                if degree_diff <= 5:
                    dignity['status'] = 'debilitated'
                    dignity['strength_percentage'] = 20 - (degree_diff * 2)
                    dignity['description'] = f'Debilitated in {sign}'
                else:
                    dignity['status'] = 'weak'
                    dignity['strength_percentage'] = 35
                    dignity['description'] = f'Weak in {sign} (debilitation sign)'
        
        # Check own sign
        if planet_name in self.OWN_SIGNS:
            if sign in self.OWN_SIGNS[planet_name]:
                if dignity['status'] == 'neutral':
                    dignity['status'] = 'own_sign'
                    dignity['strength_percentage'] = 85
                    dignity['description'] = f'In own sign ({sign})'
        
        # Check mooltrikona
        if planet_name in self.MOOLTRIKONA:
            if sign == self.MOOLTRIKONA[planet_name]:
                if dignity['status'] not in ['exalted', 'debilitated']:
                    dignity['status'] = 'mooltrikona'
                    dignity['strength_percentage'] = 90
                    dignity['description'] = f'In Mooltrikona sign ({sign})'
        
        return dignity
    
    def check_combustion(self, sun_lon: float, planet_lon: float, planet_name: str) -> Dict:
        """
        Check if a planet is combust (too close to Sun)
        
        Args:
            sun_lon: Sun's longitude
            planet_lon: Planet's longitude
            planet_name: Name of the planet
        
        Returns:
            Dictionary with combustion status
        """
        # Combustion degrees for each planet
        combustion_orbs = {
            'Moon': 12,
            'Mars': 17,
            'Mercury': 14,  # Exception: if retrograde, not combust
            'Jupiter': 11,
            'Venus': 10,
            'Saturn': 15,
        }
        
        if planet_name not in combustion_orbs:
            return {'is_combust': False, 'distance': None}
        
        # Calculate angular distance
        diff = abs(sun_lon - planet_lon)
        if diff > 180:
            diff = 360 - diff
        
        orb = combustion_orbs[planet_name]
        is_combust = diff <= orb
        
        return {
            'is_combust': is_combust,
            'distance': diff,
            'orb_limit': orb,
            'description': f'Combust (within {diff:.2f}° of Sun)' if is_combust else 'Not combust'
        }
    
    def calculate_planetary_aspects(self, planets: Dict) -> Dict:
        """
        Calculate aspects between planets
        
        Args:
            planets: Dictionary of planet positions
        
        Returns:
            Dictionary of aspects
        """
        aspects = []
        
        # Special aspects in Vedic astrology
        special_aspects = {
            'Mars': [4, 7, 8],      # 4th, 7th, 8th houses
            'Jupiter': [5, 7, 9],   # 5th, 7th, 9th houses
            'Saturn': [3, 7, 10],   # 3rd, 7th, 10th houses
        }
        
        planet_list = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
        
        for i, planet1 in enumerate(planet_list):
            if planet1 not in planets:
                continue
                
            for planet2 in planet_list[i+1:]:
                if planet2 not in planets:
                    continue
                
                # Calculate angular distance
                lon1 = planets[planet1]['longitude']
                lon2 = planets[planet2]['longitude']
                
                diff = abs(lon1 - lon2)
                if diff > 180:
                    diff = 360 - diff
                
                # Check for conjunction (0°, orb ±10°)
                if diff <= 10:
                    aspects.append({
                        'planet1': planet1,
                        'planet2': planet2,
                        'aspect_type': 'conjunction',
                        'angle': diff,
                        'strength': 100 - (diff * 5),
                        'is_beneficial': self._is_friendly(planet1, planet2)
                    })
                
                # Check for opposition (180°, orb ±10°)
                elif 170 <= diff <= 190:
                    aspects.append({
                        'planet1': planet1,
                        'planet2': planet2,
                        'aspect_type': 'opposition',
                        'angle': diff,
                        'strength': 100 - abs(180 - diff) * 5,
                        'is_beneficial': False
                    })
                
                # Check for trine (120°, orb ±10°)
                elif 110 <= diff <= 130:
                    aspects.append({
                        'planet1': planet1,
                        'planet2': planet2,
                        'aspect_type': 'trine',
                        'angle': diff,
                        'strength': 100 - abs(120 - diff) * 5,
                        'is_beneficial': True
                    })
                
                # Check for square (90°, orb ±10°)
                elif 80 <= diff <= 100:
                    aspects.append({
                        'planet1': planet1,
                        'planet2': planet2,
                        'aspect_type': 'square',
                        'angle': diff,
                        'strength': 100 - abs(90 - diff) * 5,
                        'is_beneficial': False
                    })
        
        return {
            'aspects': aspects,
            'total_aspects': len(aspects),
            'beneficial_aspects': len([a for a in aspects if a['is_beneficial']]),
            'challenging_aspects': len([a for a in aspects if not a['is_beneficial']])
        }
    
    def _is_friendly(self, planet1: str, planet2: str) -> bool:
        """Check if two planets are friends"""
        if planet1 in self.RELATIONSHIPS and planet2 in self.RELATIONSHIPS[planet1]['friends']:
            return True
        return False
    
    def check_retrograde(self, jd: float, planet_id: int) -> bool:
        """
        Check if a planet is retrograde
        
        Args:
            jd: Julian Day Number
            planet_id: Swiss Ephemeris planet ID
        
        Returns:
            True if retrograde, False otherwise
        """
        result = swe.calc_ut(jd, planet_id)
        speed = result[0][3]
        return speed < 0
    
    def calculate_shadbala(self, planets: Dict, houses: List, jd: float) -> Dict:
        """
        Calculate Shadbala (six-fold strength) for planets
        
        Args:
            planets: Dictionary of planet positions
            houses: List of house cusps
            jd: Julian Day Number
        
        Returns:
            Dictionary with Shadbala scores
        """
        shadbala_scores = {}
        
        for planet_name, planet_data in planets.items():
            if planet_name in ['Rahu', 'Ketu']:
                continue
            
            total_strength = 0
            
            # 1. Sthana Bala (Positional Strength) - 30%
            dignity = self.get_planet_dignity(
                planet_name,
                planet_data['sign'],
                planet_data['degree']
            )
            sthana_bala = dignity['strength_percentage'] * 0.3
            
            # 2. Dig Bala (Directional Strength) - 20%
            # Jupiter/Mercury: East (1st house), Moon/Venus: North (4th), 
            # Saturn: West (7th), Sun/Mars: South (10th)
            dig_bala = 10  # Simplified calculation
            
            # 3. Kala Bala (Temporal Strength) - 20%
            # Day/night, month, year, etc.
            kala_bala = 10  # Simplified
            
            # 4. Chesta Bala (Motional Strength) - 15%
            chesta_bala = 0 if planet_data.get('is_retrograde') else 15
            
            # 5. Naisargika Bala (Natural Strength) - 10%
            natural_strength = {
                'Sun': 10, 'Moon': 9, 'Venus': 8, 'Jupiter': 7.5,
                'Mercury': 7, 'Mars': 6, 'Saturn': 5
            }
            naisargika_bala = natural_strength.get(planet_name, 7)
            
            # 6. Drik Bala (Aspectual Strength) - 5%
            drik_bala = 2.5  # Simplified
            
            total_strength = (
                sthana_bala + dig_bala + kala_bala + 
                chesta_bala + naisargika_bala + drik_bala
            )
            
            shadbala_scores[planet_name] = {
                'total_strength': round(total_strength, 2),
                'sthana_bala': round(sthana_bala, 2),
                'dig_bala': round(dig_bala, 2),
                'kala_bala': round(kala_bala, 2),
                'chesta_bala': round(chesta_bala, 2),
                'naisargika_bala': round(naisargika_bala, 2),
                'drik_bala': round(drik_bala, 2),
                'strength_level': self._get_strength_level(total_strength)
            }
        
        return shadbala_scores
    
    def _get_strength_level(self, strength: float) -> str:
        """Convert strength score to level"""
        if strength >= 70:
            return 'Very Strong'
        elif strength >= 50:
            return 'Strong'
        elif strength >= 35:
            return 'Moderate'
        elif strength >= 20:
            return 'Weak'
        else:
            return 'Very Weak'
    
    def analyze_planets(
        self,
        planets: Dict,
        houses: List,
        sun_position: float,
        jd: float
    ) -> Dict:
        """
        Complete planetary analysis
        
        Args:
            planets: Dictionary of planet positions
            houses: List of house cusps
            sun_position: Sun's longitude
            jd: Julian Day Number
        
        Returns:
            Complete analysis dictionary
        """
        analysis = {
            'dignities': {},
            'combustion': {},
            'aspects': None,
            'shadbala': None
        }
        
        # Calculate dignities for each planet
        for planet_name, planet_data in planets.items():
            if planet_name not in ['Rahu', 'Ketu']:
                analysis['dignities'][planet_name] = self.get_planet_dignity(
                    planet_name,
                    planet_data['sign'],
                    planet_data['degree']
                )
                
                # Check combustion
                if planet_name != 'Sun':
                    analysis['combustion'][planet_name] = self.check_combustion(
                        sun_position,
                        planet_data['longitude'],
                        planet_name
                    )
        
        # Calculate aspects
        analysis['aspects'] = self.calculate_planetary_aspects(planets)
        
        # Calculate Shadbala
        analysis['shadbala'] = self.calculate_shadbala(planets, houses, jd)
        
        return analysis


# Example usage
if __name__ == "__main__":
    calculator = PlanetaryPositions()
    
    # Example planet data
    planets = {
        'Sun': {'longitude': 54.5, 'sign': 'Taurus', 'degree': 24.5},
        'Moon': {'longitude': 32.8, 'sign': 'Taurus', 'degree': 2.8},
        'Mars': {'longitude': 280.2, 'sign': 'Capricorn', 'degree': 10.2},
    }
    
    # Test dignity
    dignity = calculator.get_planet_dignity('Moon', 'Taurus', 2.8)
    print("Moon Dignity:", dignity)