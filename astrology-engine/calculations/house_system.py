# astrology-engine/calculations/house_system.py
# House System Calculator - Bhava (House) Analysis

import swisseph as swe
from datetime import datetime
from typing import Dict, List, Optional

class HouseSystem:
    """
    Calculate house cusps, house lords, bhava analysis,
    and planetary placement in houses for Vedic astrology.
    """
    
    SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    # Sign rulers (lords)
    SIGN_LORDS = {
        'Aries': 'Mars',
        'Taurus': 'Venus',
        'Gemini': 'Mercury',
        'Cancer': 'Moon',
        'Leo': 'Sun',
        'Virgo': 'Mercury',
        'Libra': 'Venus',
        'Scorpio': 'Mars',
        'Sagittarius': 'Jupiter',
        'Capricorn': 'Saturn',
        'Aquarius': 'Saturn',
        'Pisces': 'Jupiter',
    }
    
    # House significations (Bhava meanings)
    HOUSE_MEANINGS = {
        1: {
            'name': 'Lagna/Ascendant',
            'signifies': ['Self', 'Personality', 'Physical body', 'Health', 'General life'],
            'type': 'Kendra (Angular)',
            'nature': 'Very strong'
        },
        2: {
            'name': 'Dhana Bhava',
            'signifies': ['Wealth', 'Family', 'Speech', 'Food', 'Savings', 'Face'],
            'type': 'Maraka (Death-inflicting)',
            'nature': 'Neutral'
        },
        3: {
            'name': 'Sahaja Bhava',
            'signifies': ['Siblings', 'Courage', 'Communication', 'Short travels', 'Skills'],
            'type': 'Upachaya (Growing)',
            'nature': 'Moderately strong'
        },
        4: {
            'name': 'Sukha Bhava',
            'signifies': ['Mother', 'Home', 'Property', 'Vehicles', 'Education', 'Happiness'],
            'type': 'Kendra (Angular)',
            'nature': 'Very strong'
        },
        5: {
            'name': 'Putra Bhava',
            'signifies': ['Children', 'Intelligence', 'Creativity', 'Romance', 'Past karma'],
            'type': 'Trikona (Trine)',
            'nature': 'Very strong'
        },
        6: {
            'name': 'Ripu Bhava',
            'signifies': ['Enemies', 'Diseases', 'Debts', 'Service', 'Obstacles'],
            'type': 'Dusthana (Malefic) & Upachaya',
            'nature': 'Challenging but grows'
        },
        7: {
            'name': 'Kalatra Bhava',
            'signifies': ['Spouse', 'Marriage', 'Partnership', 'Business', 'Public'],
            'type': 'Kendra (Angular) & Maraka',
            'nature': 'Very strong'
        },
        8: {
            'name': 'Ayu Bhava',
            'signifies': ['Longevity', 'Death', 'Transformation', 'Occult', 'Inheritance'],
            'type': 'Dusthana (Malefic)',
            'nature': 'Very challenging'
        },
        9: {
            'name': 'Dharma Bhava',
            'signifies': ['Father', 'Fortune', 'Spirituality', 'Long travels', 'Higher learning'],
            'type': 'Trikona (Trine)',
            'nature': 'Very strong'
        },
        10: {
            'name': 'Karma Bhava',
            'signifies': ['Career', 'Profession', 'Status', 'Authority', 'Actions'],
            'type': 'Kendra (Angular)',
            'nature': 'Very strong'
        },
        11: {
            'name': 'Labha Bhava',
            'signifies': ['Gains', 'Income', 'Friends', 'Ambitions', 'Elder siblings'],
            'type': 'Upachaya (Growing)',
            'nature': 'Moderately strong'
        },
        12: {
            'name': 'Vyaya Bhava',
            'signifies': ['Losses', 'Expenses', 'Foreign lands', 'Spirituality', 'Sleep', 'Moksha'],
            'type': 'Dusthana (Malefic)',
            'nature': 'Challenging'
        }
    }
    
    def __init__(self):
        """Initialize House System Calculator"""
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    def calculate_houses(
        self,
        jd: float,
        latitude: float,
        longitude: float,
        house_system: str = 'P'
    ) -> List[Dict]:
        """
        Calculate house cusps
        
        Args:
            jd: Julian Day Number
            latitude: Geographic latitude
            longitude: Geographic longitude
            house_system: 'P' = Placidus, 'K' = Koch, 'E' = Equal
        
        Returns:
            List of 12 house dictionaries
        """
        # Calculate houses using Swiss Ephemeris
        cusps, ascmc = swe.houses(jd, latitude, longitude, house_system.encode())
        
        # Get ayanamsa for sidereal conversion
        ayanamsa = swe.get_ayanamsa(jd)
        
        houses = []
        
        for i in range(12):
            # Convert tropical to sidereal
            tropical_cusp = cusps[i]
            sidereal_cusp = (tropical_cusp - ayanamsa) % 360
            
            # Get sign and degree
            sign_num = int(sidereal_cusp / 30)
            degree = sidereal_cusp % 30
            sign = self.SIGNS[sign_num]
            
            # Get house lord
            lord = self.SIGN_LORDS[sign]
            
            houses.append({
                'house_num': i + 1,
                'cusp_longitude': sidereal_cusp,
                'sign': sign,
                'sign_num': sign_num + 1,
                'degree': degree,
                'lord': lord,
                'meanings': self.HOUSE_MEANINGS[i + 1],
                'formatted': f"House {i + 1} ({self.HOUSE_MEANINGS[i + 1]['name']}): {sign} {degree:.2f}°"
            })
        
        return houses
    
    def calculate_bhava_madhya(self, houses: List[Dict]) -> List[Dict]:
        """
        Calculate Bhava Madhya (middle point of each house)
        
        Args:
            houses: List of house cusps
        
        Returns:
            List of houses with bhava madhya
        """
        bhava_houses = []
        
        for i in range(12):
            current_cusp = houses[i]['cusp_longitude']
            next_cusp = houses[(i + 1) % 12]['cusp_longitude']
            
            # Calculate middle point
            if next_cusp < current_cusp:
                next_cusp += 360
            
            bhava_madhya = (current_cusp + next_cusp) / 2
            if bhava_madhya >= 360:
                bhava_madhya -= 360
            
            bhava_houses.append({
                **houses[i],
                'bhava_madhya': bhava_madhya,
                'house_span_start': current_cusp,
                'house_span_end': next_cusp % 360,
            })
        
        return bhava_houses
    
    def get_planet_house(
        self,
        planet_longitude: float,
        ascendant_sign_num: int
    ) -> int:
        """
        Get house number where a planet is placed (Whole Sign system)
        
        Args:
            planet_longitude: Planet's sidereal longitude
            ascendant_sign_num: Ascendant sign number (1-12)
        
        Returns:
            House number (1-12)
        """
        # Get planet's sign
        planet_sign = int(planet_longitude / 30) + 1
        
        # Calculate house number from ascendant
        house_num = ((planet_sign - ascendant_sign_num) % 12) + 1
        
        return house_num
    
    def get_planet_house_bhava_chalit(
        self,
        planet_longitude: float,
        houses: List[Dict]
    ) -> int:
        """
        Get house number using Bhava Chalit (cusp-based) system
        
        Args:
            planet_longitude: Planet's sidereal longitude
            houses: List of house cusps
        
        Returns:
            House number (1-12)
        """
        for i in range(12):
            house_start = houses[i]['cusp_longitude']
            house_end = houses[(i + 1) % 12]['cusp_longitude']
            
            # Handle wrap-around at 360°
            if house_end < house_start:
                house_end += 360
                check_lon = planet_longitude if planet_longitude >= house_start else planet_longitude + 360
            else:
                check_lon = planet_longitude
            
            if house_start <= check_lon < house_end:
                return i + 1
        
        return 1  # Default to 1st house
    
    def analyze_house_strength(self, houses: List[Dict], planets: Dict) -> Dict:
        """
        Analyze strength of each house
        
        Args:
            houses: List of house cusps
            planets: Dictionary of planet positions
        
        Returns:
            Dictionary with house strength analysis
        """
        house_analysis = {}
        
        for house in houses:
            house_num = house['house_num']
            house_lord = house['lord']
            
            # Find where house lord is placed
            lord_position = None
            lord_house = None
            
            if house_lord in planets:
                lord_position = planets[house_lord]
                lord_house = self.get_planet_house(
                    lord_position['longitude'],
                    houses[0]['sign_num']
                )
            
            # Count planets in this house
            planets_in_house = []
            for planet_name, planet_data in planets.items():
                planet_house = self.get_planet_house(
                    planet_data['longitude'],
                    houses[0]['sign_num']
                )
                if planet_house == house_num:
                    planets_in_house.append(planet_name)
            
            # Determine house strength
            strength_score = 50  # Base
            
            # Kendras (1, 4, 7, 10) are strongest
            if house_num in [1, 4, 7, 10]:
                strength_score += 20
            
            # Trikonas (1, 5, 9) are very strong
            if house_num in [1, 5, 9]:
                strength_score += 25
            
            # Dusthanas (6, 8, 12) are weak
            if house_num in [6, 8, 12]:
                strength_score -= 25
            
            # Planets in house add strength
            strength_score += len(planets_in_house) * 5
            
            house_analysis[house_num] = {
                'house_info': house['meanings'],
                'sign': house['sign'],
                'lord': house_lord,
                'lord_placed_in_house': lord_house,
                'planets_in_house': planets_in_house,
                'num_planets': len(planets_in_house),
                'strength_score': min(100, max(0, strength_score)),
                'strength_level': self._get_strength_level(strength_score)
            }
        
        return house_analysis
    
    def _get_strength_level(self, score: float) -> str:
        """Convert strength score to level"""
        if score >= 80:
            return 'Very Strong'
        elif score >= 60:
            return 'Strong'
        elif score >= 40:
            return 'Moderate'
        elif score >= 25:
            return 'Weak'
        else:
            return 'Very Weak'
    
    def get_kendra_houses(self) -> List[int]:
        """Get Kendra (Angular) houses - 1, 4, 7, 10"""
        return [1, 4, 7, 10]
    
    def get_trikona_houses(self) -> List[int]:
        """Get Trikona (Trine) houses - 1, 5, 9"""
        return [1, 5, 9]
    
    def get_dusthana_houses(self) -> List[int]:
        """Get Dusthana (Malefic) houses - 6, 8, 12"""
        return [6, 8, 12]
    
    def get_upachaya_houses(self) -> List[int]:
        """Get Upachaya (Growing) houses - 3, 6, 10, 11"""
        return [3, 6, 10, 11]
    
    def check_planetary_yogas_by_house(
        self,
        houses: List[Dict],
        planets: Dict
    ) -> List[Dict]:
        """
        Check for important yogas based on house placements
        
        Args:
            houses: List of house cusps
            planets: Dictionary of planet positions
        
        Returns:
            List of detected yogas
        """
        yogas = []
        ascendant_sign = houses[0]['sign_num']
        
        # Get planet house placements
        planet_houses = {}
        for planet_name, planet_data in planets.items():
            planet_houses[planet_name] = self.get_planet_house(
                planet_data['longitude'],
                ascendant_sign
            )
        
        # Check Raj Yoga (lords of Kendra and Trikona together)
        kendras = [1, 4, 7, 10]
        trikonas = [1, 5, 9]
        
        kendra_lords = [houses[k-1]['lord'] for k in kendras]
        trikona_lords = [houses[t-1]['lord'] for t in trikonas]
        
        for kendra_lord in kendra_lords:
            if kendra_lord in planet_houses:
                kendra_house = planet_houses[kendra_lord]
                for trikona_lord in trikona_lords:
                    if trikona_lord in planet_houses:
                        trikona_house = planet_houses[trikona_lord]
                        if kendra_house == trikona_house:
                            yogas.append({
                                'name': 'Raj Yoga',
                                'description': f'{kendra_lord} (Kendra lord) with {trikona_lord} (Trikona lord) in house {kendra_house}',
                                'strength': 'Strong',
                                'effect': 'Power, authority, success'
                            })
        
        # Check Dhana Yoga (wealth combinations)
        # Lord of 2nd and 11th houses together
        lord_2 = houses[1]['lord']
        lord_11 = houses[10]['lord']
        
        if lord_2 in planet_houses and lord_11 in planet_houses:
            if planet_houses[lord_2] == planet_houses[lord_11]:
                yogas.append({
                    'name': 'Dhana Yoga',
                    'description': f'Lord of 2nd ({lord_2}) with lord of 11th ({lord_11})',
                    'strength': 'Strong',
                    'effect': 'Wealth accumulation, financial gains'
                })
        
        # Check Viparita Raja Yoga (lords of dusthanas in dusthanas)
        dusthana_lords = [houses[5]['lord'], houses[7]['lord'], houses[11]['lord']]
        
        for lord in dusthana_lords:
            if lord in planet_houses:
                lord_house = planet_houses[lord]
                if lord_house in [6, 8, 12]:
                    yogas.append({
                        'name': 'Viparita Raja Yoga',
                        'description': f'{lord} (Dusthana lord) in dusthana house {lord_house}',
                        'strength': 'Moderate',
                        'effect': 'Turning difficulties into success'
                    })
        
        return yogas
    
    def generate_house_report(
        self,
        houses: List[Dict],
        planets: Dict
    ) -> Dict:
        """
        Generate comprehensive house analysis report
        
        Args:
            houses: List of house cusps
            planets: Dictionary of planet positions
        
        Returns:
            Complete house report
        """
        # Calculate bhava madhya
        bhava_houses = self.calculate_bhava_madhya(houses)
        
        # Analyze house strengths
        house_analysis = self.analyze_house_strength(houses, planets)
        
        # Check yogas
        yogas = self.check_planetary_yogas_by_house(houses, planets)
        
        return {
            'houses': bhava_houses,
            'house_analysis': house_analysis,
            'detected_yogas': yogas,
            'kendra_houses': self.get_kendra_houses(),
            'trikona_houses': self.get_trikona_houses(),
            'dusthana_houses': self.get_dusthana_houses(),
            'upachaya_houses': self.get_upachaya_houses(),
        }


# Example usage
if __name__ == "__main__":
    house_calc = HouseSystem()
    
    # Example Julian Day
    jd = 2448000.5  # Example JD
    latitude = 28.6139  # Delhi
    longitude = 77.2090
    
    # Calculate houses
    houses = house_calc.calculate_houses(jd, latitude, longitude)
    
    print("House 1 (Ascendant):", houses[0]['formatted'])
    print("House 10 (Career):", houses[9]['formatted'])