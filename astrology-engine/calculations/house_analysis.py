# astrology-engine/calculations/house_analysis.py
# House (Bhava) Analysis Calculator - Factual Data Only

import swisseph as swe
from typing import Dict, List
from datetime import datetime

class HouseAnalyzer:
    """
    Analyze all 12 houses (Bhavas) in a birth chart.
    Provides factual data: sign in house, house lord, and lord's placement.
    """
    
    SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    # Sign lords (rulers)
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
    
    # House names and significations
    HOUSE_INFO = {
        1: {
            'name': 'Lagna Bhava',
            'represents': 'Self, personality, physical body, health, appearance, temperament, vitality'
        },
        2: {
            'name': 'Dhana Bhava',
            'represents': 'Wealth, family, speech, possessions, finances, eating habits, values'
        },
        3: {
            'name': 'Bratru Bhava',
            'represents': 'Siblings, courage, communication, short journeys, skills, mental strength'
        },
        4: {
            'name': 'Shukha Bhava',
            'represents': 'Mother, home, property, vehicles, emotional security, education'
        },
        5: {
            'name': 'Putra Bhava',
            'represents': 'Children, creativity, intelligence, speculation, romance, education'
        },
        6: {
            'name': 'Satru Bhava',
            'represents': 'Enemies, diseases, debts, obstacles, service, daily work, health'
        },
        7: {
            'name': 'Kalatra Bhava',
            'represents': 'Spouse, marriage, partnerships, business relations, contracts'
        },
        8: {
            'name': 'Ayur Bhava',
            'represents': 'Longevity, transformation, inheritance, occult, mysteries, research'
        },
        9: {
            'name': 'Bhagya Bhava',
            'represents': 'Fortune, father, religion, spirituality, higher education, philosophy'
        },
        10: {
            'name': 'Karma Bhava',
            'represents': 'Career, profession, reputation, status, authority, achievements'
        },
        11: {
            'name': 'Labha Bhava',
            'represents': 'Gains, income, friends, elder siblings, aspirations, fulfillment'
        },
        12: {
            'name': 'Vyaya Bhava',
            'represents': 'Losses, expenses, isolation, foreign lands, spirituality, liberation'
        }
    }
    
    def __init__(self):
        """Initialize House Analyzer"""
        pass
    
    def get_house_cusps(self, jd: float, latitude: float, longitude: float) -> List[Dict]:
        """
        Calculate all 12 house cusps using Placidus system
        """
        houses = swe.houses(jd, latitude, longitude, b'P')
        ayanamsa = swe.get_ayanamsa(jd)
        
        house_data = []
        
        for i in range(12):
            tropical_cusp = houses[0][i]
            sidereal_cusp = (tropical_cusp - ayanamsa) % 360
            
            sign_num = int(sidereal_cusp / 30) + 1
            degree_in_sign = sidereal_cusp % 30
            
            house_data.append({
                'house_num': i + 1,
                'cusp_longitude': sidereal_cusp,
                'sign': self.SIGNS[sign_num - 1],
                'sign_num': sign_num,
                'degree': degree_in_sign,
                'formatted': f"{self.SIGNS[sign_num - 1]} {degree_in_sign:.2f}°"
            })
        
        return house_data
    
    def find_planet_house(self, planet_longitude: float, house_cusps: List[Dict]) -> int:
        """Find which house a planet is placed in"""
        for i in range(12):
            current_cusp = house_cusps[i]['cusp_longitude']
            next_cusp = house_cusps[(i + 1) % 12]['cusp_longitude']
            
            if next_cusp < current_cusp:
                if planet_longitude >= current_cusp or planet_longitude < next_cusp:
                    return i + 1
            else:
                if current_cusp <= planet_longitude < next_cusp:
                    return i + 1
        
        return 1
    
    def analyze_house(self, house_num: int, house_cusps: List[Dict], planets: Dict) -> Dict:
        """Analyze a single house - factual data only"""
        house_sign = house_cusps[house_num - 1]['sign']
        house_lord = self.SIGN_LORDS[house_sign]
        
        lord_planet = planets.get(house_lord)
        
        if lord_planet:
            lord_house = self.find_planet_house(lord_planet['longitude'], house_cusps)
            lord_sign = lord_planet['sign']
            lord_placement = f"{self._get_ordinal(lord_house)} house in {lord_sign}"
        else:
            lord_house = None
            lord_sign = None
            lord_placement = "Not calculated"
        
        planets_in_house = []
        for planet_name, planet_data in planets.items():
            planet_house = self.find_planet_house(planet_data['longitude'], house_cusps)
            if planet_house == house_num:
                planets_in_house.append({
                    'name': planet_name,
                    'sign': planet_data['sign'],
                    'degree': planet_data['degree'],
                    'retrograde': planet_data.get('is_retrograde', False)
                })
        
        return {
            'house_number': house_num,
            'house_name': self.HOUSE_INFO[house_num]['name'],
            'represents': self.HOUSE_INFO[house_num]['represents'],
            'sign_in_house': house_sign,
            'house_lord': house_lord,
            'lord_placement': {
                'house': lord_house,
                'sign': lord_sign,
                'description': lord_placement
            },
            'planets_in_house': planets_in_house,
            'house_cusp': house_cusps[house_num - 1]['formatted']
        }
    
    def _get_ordinal(self, n: int) -> str:
        """Convert number to ordinal (1st, 2nd, 3rd, etc.)"""
        if 10 <= n % 100 <= 20:
            suffix = 'th'
        else:
            suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
        return f"{n}{suffix}"
    
    def analyze_all_houses(self, jd: float, latitude: float, longitude: float, planets: Dict) -> List[Dict]:
        """Analyze all 12 houses"""
        house_cusps = self.get_house_cusps(jd, latitude, longitude)
        
        all_houses = []
        for house_num in range(1, 13):
            house_analysis = self.analyze_house(house_num, house_cusps, planets)
            all_houses.append(house_analysis)
        
        return all_houses


if __name__ == "__main__":
    jd = 2448066.104166667
    latitude = 19.0760
    longitude = 72.8777
    
    planets = {
        'Sun': {'longitude': 30.55, 'sign': 'Taurus', 'degree': 0.55, 'is_retrograde': False},
        'Moon': {'longitude': 91.90, 'sign': 'Cancer', 'degree': 1.90, 'is_retrograde': False},
    }
    
    analyzer = HouseAnalyzer()
    houses = analyzer.analyze_all_houses(jd, latitude, longitude, planets)
    
    for house in houses:
        print(f"{house['house_number']}. {house['house_name']} - {house['sign_in_house']}")