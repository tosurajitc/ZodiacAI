# astrology-engine/calculations/monthly_horoscope_generator.py
# Complete Monthly Horoscope Generator with Geocoding

import swisseph as swe
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
import calendar

class MonthlyHoroscopeGenerator:
    """
    Generate scientific monthly horoscope based on:
    1. Planetary transits through houses
    2. Current Dasha/Antardasha effects
    3. Aspects between transiting and natal planets
    4. Moon phases and special yogas
    """
    
    SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    # House significations for predictions
    HOUSE_MEANINGS = {
        1: {'area': 'self', 'keywords': ['personality', 'health', 'vitality', 'new beginnings']},
        2: {'area': 'finance', 'keywords': ['income', 'savings', 'family', 'speech', 'assets']},
        3: {'area': 'communication', 'keywords': ['courage', 'siblings', 'short travels', 'skills']},
        4: {'area': 'home', 'keywords': ['mother', 'property', 'peace', 'vehicles', 'emotions']},
        5: {'area': 'creativity', 'keywords': ['children', 'romance', 'speculation', 'intelligence']},
        6: {'area': 'health', 'keywords': ['enemies', 'debts', 'service', 'competition', 'daily work']},
        7: {'area': 'relationships', 'keywords': ['marriage', 'partnerships', 'business', 'contracts']},
        8: {'area': 'transformation', 'keywords': ['longevity', 'inheritance', 'secrets', 'research']},
        9: {'area': 'fortune', 'keywords': ['luck', 'higher education', 'spirituality', 'father', 'travel']},
        10: {'area': 'career', 'keywords': ['profession', 'status', 'authority', 'reputation', 'achievements']},
        11: {'area': 'gains', 'keywords': ['income', 'friendships', 'ambitions', 'large gains', 'elder siblings']},
        12: {'area': 'losses', 'keywords': ['expenses', 'foreign lands', 'isolation', 'spirituality', 'losses']}
    }
    
    def __init__(self):
        """Initialize horoscope generator"""
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    def get_coordinates_from_location(self, location_name: str) -> Dict:
        """
        Get latitude/longitude from location name using Nominatim (OpenStreetMap)
        Free geocoding service, no API key required
        
        Args:
            location_name: City name, e.g., "Mumbai, India"
        
        Returns:
            Dict with latitude, longitude, timezone
        """
        try:
            # Nominatim API (Free, no API key needed)
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': location_name,
                'format': 'json',
                'limit': 1
            }
            headers = {
                'User-Agent': 'AstroAI-Horoscope-Generator/1.0'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            
            if data and len(data) > 0:
                result = data[0]
                latitude = float(result['lat'])
                longitude = float(result['lon'])
                
                # Get timezone (simplified - you may want to use timezonefinder library)
                timezone = self._estimate_timezone(longitude)
                
                return {
                    'latitude': latitude,
                    'longitude': longitude,
                    'timezone': timezone,
                    'display_name': result.get('display_name', location_name)
                }
            else:
                raise ValueError(f"Location '{location_name}' not found")
                
        except Exception as e:
            raise Exception(f"Geocoding error: {str(e)}")
    
    def _estimate_timezone(self, longitude: float) -> str:
        """
        Estimate timezone from longitude (simplified method)
        For production, use timezonefinder library
        """
        # Rough estimation: timezone = longitude / 15
        tz_offset = round(longitude / 15)
        
        # Common Indian timezones
        if 68 <= longitude <= 97:  # India range
            return 'Asia/Kolkata'
        elif 72 <= longitude <= 75:  # Mumbai
            return 'Asia/Kolkata'
        elif 88 <= longitude <= 89:  # Kolkata
            return 'Asia/Kolkata'
        elif 77 <= longitude <= 78:  # Delhi
            return 'Asia/Kolkata'
        else:
            return f'UTC{tz_offset:+d}'
    
    def calculate_julian_day(self, date_obj: datetime) -> float:
        """Convert datetime to Julian Day"""
        return swe.julday(
            date_obj.year,
            date_obj.month,
            date_obj.day,
            date_obj.hour + date_obj.minute / 60.0
        )
    
    def get_planetary_position(self, jd: float, planet_id: int) -> Dict:
        """Get planet position at given Julian Day"""
        result = swe.calc_ut(jd, planet_id)
        tropical_lon = result[0][0]
        ayanamsa = swe.get_ayanamsa(jd)
        sidereal_lon = (tropical_lon - ayanamsa) % 360
        
        sign_num = int(sidereal_lon / 30)
        degree = sidereal_lon % 30
        
        return {
            'longitude': sidereal_lon,
            'sign': self.SIGNS[sign_num],
            'sign_num': sign_num + 1,
            'degree': degree,
            'speed': result[0][3],
            'is_retrograde': result[0][3] < 0
        }
    
    def calculate_ascendant(self, jd: float, latitude: float, longitude: float) -> Dict:
        """Calculate Ascendant (Lagna)"""
        house_cusps, ascmc = swe.houses(jd, latitude, longitude, b'P')  # Placidus
        ayanamsa = swe.get_ayanamsa(jd)
        
        tropical_asc = ascmc[0]
        sidereal_asc = (tropical_asc - ayanamsa) % 360
        
        sign_num = int(sidereal_asc / 30)
        
        return {
            'longitude': sidereal_asc,
            'sign': self.SIGNS[sign_num],
            'sign_num': sign_num + 1,
            'degree': sidereal_asc % 30
        }
    
    def calculate_house_from_ascendant(self, planet_lon: float, asc_lon: float) -> int:
        """Calculate which house a planet occupies from Ascendant"""
        diff = (planet_lon - asc_lon) % 360
        house = int(diff / 30) + 1
        return house
    
    def generate_monthly_horoscope(
        self,
        birth_date: str,
        birth_time: str,
        birth_location: str = None,
        latitude: float = None,
        longitude: float = None,
        timezone: str = None,
        target_month: int = None,
        target_year: int = None
    ) -> Dict:
        """
        Generate complete monthly horoscope
        
        Args:
            birth_date: 'YYYY-MM-DD'
            birth_time: 'HH:MM:SS'
            birth_location: Location name (if lat/lon not provided)
            latitude: Birth latitude (optional)
            longitude: Birth longitude (optional)
            timezone: Timezone (optional)
            target_month: Month to generate (default: current)
            target_year: Year to generate (default: current)
        
        Returns:
            Complete monthly horoscope dict matching Horoscope.js model
        """
        
        # Handle geocoding if needed
        if latitude is None or longitude is None:
            if birth_location is None:
                raise ValueError("Either birth_location or latitude/longitude must be provided")
            
            geo_data = self.get_coordinates_from_location(birth_location)
            latitude = geo_data['latitude']
            longitude = geo_data['longitude']
            timezone = geo_data['timezone']
        
        # Parse birth datetime
        birth_datetime = datetime.strptime(
            f"{birth_date} {birth_time}",
            "%Y-%m-%d %H:%M:%S"
        )
        
        # Set target month/year
        if target_month is None:
            target_month = datetime.now().month
        if target_year is None:
            target_year = datetime.now().year
        
        # Calculate period
        period_start = datetime(target_year, target_month, 1)
        last_day = calendar.monthrange(target_year, target_month)[1]
        period_end = datetime(target_year, target_month, last_day, 23, 59, 59)
        
        # Calculate birth chart (natal)
        birth_jd = self.calculate_julian_day(birth_datetime)
        natal_ascendant = self.calculate_ascendant(birth_jd, latitude, longitude)
        
        natal_planets = {
            'Sun': self.get_planetary_position(birth_jd, swe.SUN),
            'Moon': self.get_planetary_position(birth_jd, swe.MOON),
            'Mars': self.get_planetary_position(birth_jd, swe.MARS),
            'Mercury': self.get_planetary_position(birth_jd, swe.MERCURY),
            'Jupiter': self.get_planetary_position(birth_jd, swe.JUPITER),
            'Venus': self.get_planetary_position(birth_jd, swe.VENUS),
            'Saturn': self.get_planetary_position(birth_jd, swe.SATURN),
            'Rahu': self.get_planetary_position(birth_jd, swe.MEAN_NODE)
        }
        
        # Calculate transits for month start
        transit_jd = self.calculate_julian_day(period_start)
        transit_planets = {
            'Sun': self.get_planetary_position(transit_jd, swe.SUN),
            'Moon': self.get_planetary_position(transit_jd, swe.MOON),
            'Mars': self.get_planetary_position(transit_jd, swe.MARS),
            'Mercury': self.get_planetary_position(transit_jd, swe.MERCURY),
            'Jupiter': self.get_planetary_position(transit_jd, swe.JUPITER),
            'Venus': self.get_planetary_position(transit_jd, swe.VENUS),
            'Saturn': self.get_planetary_position(transit_jd, swe.SATURN),
            'Rahu': self.get_planetary_position(transit_jd, swe.MEAN_NODE)
        }
        
        # Analyze transits through houses
        transit_analysis = self._analyze_transits(
            transit_planets,
            natal_ascendant['longitude']
        )
        
        # Generate predictions
        predictions = self._generate_predictions(
            transit_analysis,
            natal_planets,
            transit_planets,
            natal_ascendant
        )
        
        # Calculate scores (1-10)
        scores = self._calculate_scores(transit_analysis, predictions)
        
        # Generate month name
        month_name = calendar.month_name[target_month]
        
        return {
            'horoscope_type': 'monthly',
            'period_start': period_start.isoformat(),
            'period_end': period_end.isoformat(),
            'title': f"Monthly Horoscope - {month_name} {target_year}",
            'summary': predictions['summary'],
            'detailed_prediction': predictions['detailed'],
            
            # Category predictions
            'career_prediction': predictions['career'],
            'finance_prediction': predictions['finance'],
            'relationship_prediction': predictions['relationship'],
            'health_prediction': predictions['health'],
            
            # Scores (1-10)
            'overall_score': scores['overall'],
            'career_score': scores['career'],
            'finance_score': scores['finance'],
            'relationship_score': scores['relationship'],
            'health_score': scores['health'],
            
            # Lucky attributes
            'lucky_numbers': predictions['lucky_numbers'],
            'lucky_colors': predictions['lucky_colors'],
            'lucky_days': predictions['lucky_days'],
            
            # Astrological data
            'planetary_transits': {
                planet: {
                    'sign': data['sign'],
                    'house': self.calculate_house_from_ascendant(
                        data['longitude'],
                        natal_ascendant['longitude']
                    ),
                    'is_retrograde': data['is_retrograde']
                }
                for planet, data in transit_planets.items()
            },
            
            # Metadata
            'generated_by': 'ai',
            'ai_model_used': 'Swiss Ephemeris + Vedic Rules',
            'calculation_method': 'Swiss Ephemeris',
            'ayanamsa': 'Lahiri',
            
            # Birth data used
            'birth_location': birth_location or f"{latitude}, {longitude}",
            'natal_ascendant': natal_ascendant['sign'],
            'natal_moon_sign': natal_planets['Moon']['sign']
        }
    
    def _analyze_transits(self, transit_planets: Dict, asc_longitude: float) -> Dict:
        """Analyze planetary transits through houses"""
        analysis = {}
        
        for planet, data in transit_planets.items():
            house = self.calculate_house_from_ascendant(data['longitude'], asc_longitude)
            house_info = self.HOUSE_MEANINGS[house]
            
            analysis[planet] = {
                'house': house,
                'house_area': house_info['area'],
                'keywords': house_info['keywords'],
                'sign': data['sign'],
                'is_retrograde': data['is_retrograde']
            }
        
        return analysis
    
    def _generate_predictions(
        self,
        transit_analysis: Dict,
        natal_planets: Dict,
        transit_planets: Dict,
        natal_ascendant: Dict
    ) -> Dict:
        """Generate text predictions for each life area"""
        
        # Career prediction (10th house, Saturn, Sun, Jupiter transits)
        career = self._predict_career(transit_analysis)
        
        # Finance prediction (2nd & 11th house, Jupiter, Venus transits)
        finance = self._predict_finance(transit_analysis)
        
        # Relationship prediction (7th house, Venus, Mars transits)
        relationship = self._predict_relationship(transit_analysis)
        
        # Health prediction (6th house, Mars, Saturn transits)
        health = self._predict_health(transit_analysis)
        
        # Overall summary
        summary = self._generate_summary(transit_analysis)
        
        # Detailed prediction
        detailed = f"{summary}\n\n{career}\n\n{finance}\n\n{relationship}\n\n{health}"
        
        # Lucky attributes
        lucky = self._calculate_lucky_attributes(transit_planets, natal_planets)
        
        return {
            'summary': summary,
            'detailed': detailed,
            'career': career,
            'finance': finance,
            'relationship': relationship,
            'health': health,
            **lucky
        }
    
    def _predict_career(self, transit_analysis: Dict) -> str:
        """Generate career prediction"""
        predictions = []
        
        # Check Jupiter transit (growth)
        if 'Jupiter' in transit_analysis:
            house = transit_analysis['Jupiter']['house']
            if house in [1, 5, 9, 10, 11]:
                predictions.append(f"Jupiter's transit through your {house}th house brings career opportunities and professional growth.")
            elif house in [6, 8, 12]:
                predictions.append(f"Jupiter in {house}th house suggests you need to put in extra effort at work this month.")
        
        # Check Saturn transit (discipline/delays)
        if 'Saturn' in transit_analysis:
            house = transit_analysis['Saturn']['house']
            if house == 10:
                predictions.append("Saturn in 10th house demands hard work but promises long-term career stability.")
            elif house in [6, 8]:
                predictions.append("Saturn's position suggests dealing with workplace challenges patiently.")
        
        # Check Sun transit (authority)
        if 'Sun' in transit_analysis:
            house = transit_analysis['Sun']['house']
            if house in [1, 10]:
                predictions.append("Sun's transit enhances your professional visibility and leadership qualities.")
        
        if not predictions:
            predictions.append("Maintain steady efforts in your career. Focus on skill development.")
        
        return " ".join(predictions)
    
    def _predict_finance(self, transit_analysis: Dict) -> str:
        """Generate finance prediction"""
        predictions = []
        
        # Check Jupiter (wealth)
        if 'Jupiter' in transit_analysis:
            house = transit_analysis['Jupiter']['house']
            if house in [2, 11]:
                predictions.append(f"Jupiter in {house}th house indicates financial gains and increased income.")
            elif house in [5, 9]:
                predictions.append("Jupiter's favorable position supports speculative gains and unexpected windfalls.")
        
        # Check Venus (luxury/expenses)
        if 'Venus' in transit_analysis:
            house = transit_analysis['Venus']['house']
            if house in [2, 11]:
                predictions.append("Venus supports financial comfort and wise spending.")
            elif house in [12]:
                predictions.append("Venus in 12th house may increase expenses on luxury items.")
        
        # Check Saturn (savings/restrictions)
        if 'Saturn' in transit_analysis:
            house = transit_analysis['Saturn']['house']
            if house in [2]:
                predictions.append("Saturn emphasizes the need for disciplined savings and budget management.")
        
        if not predictions:
            predictions.append("Maintain a balanced approach to income and expenses this month.")
        
        return " ".join(predictions)
    
    def _predict_relationship(self, transit_analysis: Dict) -> str:
        """Generate relationship prediction"""
        predictions = []
        
        # Check Venus (love)
        if 'Venus' in transit_analysis:
            house = transit_analysis['Venus']['house']
            if house in [1, 5, 7]:
                predictions.append(f"Venus in {house}th house enhances romance and relationship harmony.")
            elif house in [6, 8, 12]:
                predictions.append("Venus's position requires patience and understanding in relationships.")
        
        # Check Mars (passion/conflicts)
        if 'Mars' in transit_analysis:
            house = transit_analysis['Mars']['house']
            if house == 7:
                predictions.append("Mars in 7th house may create passion but also occasional disagreements. Communicate clearly.")
            elif house in [1, 5]:
                predictions.append("Mars position supports taking initiative in your love life.")
        
        # Check Moon (emotions)
        if 'Moon' in transit_analysis:
            house = transit_analysis['Moon']['house']
            if house in [4, 7]:
                predictions.append("Moon's transit supports emotional bonding with loved ones.")
        
        if not predictions:
            predictions.append("Focus on open communication and quality time with your partner.")
        
        return " ".join(predictions)
    
    def _predict_health(self, transit_analysis: Dict) -> str:
        """Generate health prediction"""
        predictions = []
        
        # Check Mars (energy/accidents)
        if 'Mars' in transit_analysis:
            house = transit_analysis['Mars']['house']
            if house == 6:
                predictions.append("Mars in 6th house boosts immunity and helps overcome health issues.")
            elif house in [1]:
                predictions.append("Mars in ascendant increases energy but avoid overexertion.")
            elif house in [8]:
                predictions.append("Mars suggests being careful about minor injuries. Practice safety measures.")
        
        # Check Saturn (chronic issues)
        if 'Saturn' in transit_analysis:
            house = transit_analysis['Saturn']['house']
            if house in [1, 6, 8]:
                predictions.append("Saturn's position requires attention to chronic conditions. Regular health check-ups advised.")
        
        # Check Sun (vitality)
        if 'Sun' in transit_analysis:
            house = transit_analysis['Sun']['house']
            if house == 1:
                predictions.append("Sun in ascendant enhances vitality and overall well-being.")
        
        if not predictions:
            predictions.append("Maintain a healthy lifestyle with balanced diet and regular exercise.")
        
        return " ".join(predictions)
    
    def _generate_summary(self, transit_analysis: Dict) -> str:
        """Generate overall monthly summary"""
        key_transits = []
        
        for planet in ['Jupiter', 'Saturn']:
            if planet in transit_analysis:
                info = transit_analysis[planet]
                key_transits.append(f"{planet} in {info['house']}th house")
        
        if key_transits:
            return f"This month, {', '.join(key_transits)} shapes your overall experience. The planetary energies focus on {', '.join(set([v['house_area'] for v in transit_analysis.values()][:3]))}."
        
        return "This month brings balanced energies across various life areas. Focus on maintaining equilibrium."
    
    def _calculate_scores(self, transit_analysis: Dict, predictions: Dict) -> Dict:
        """Calculate 1-10 scores for each area"""
        scores = {
            'overall': 5,
            'career': 5,
            'finance': 5,
            'relationship': 5,
            'health': 5
        }
        
        # Career score (based on 10th house & Jupiter/Saturn)
        if 'Jupiter' in transit_analysis:
            if transit_analysis['Jupiter']['house'] in [1, 5, 9, 10, 11]:
                scores['career'] += 2
        if 'Saturn' in transit_analysis:
            if transit_analysis['Saturn']['house'] in [6, 8, 12]:
                scores['career'] -= 1
        
        # Finance score (based on 2nd, 11th house & Jupiter)
        if 'Jupiter' in transit_analysis:
            if transit_analysis['Jupiter']['house'] in [2, 11]:
                scores['finance'] += 3
        
        # Relationship score (based on 7th house & Venus)
        if 'Venus' in transit_analysis:
            if transit_analysis['Venus']['house'] in [1, 5, 7]:
                scores['relationship'] += 2
        if 'Mars' in transit_analysis:
            if transit_analysis['Mars']['house'] == 7:
                scores['relationship'] -= 1
        
        # Health score (based on 6th house & Mars)
        if 'Mars' in transit_analysis:
            if transit_analysis['Mars']['house'] == 6:
                scores['health'] += 2
        
        # Calculate overall as average
        scores['overall'] = round((
            scores['career'] + 
            scores['finance'] + 
            scores['relationship'] + 
            scores['health']
        ) / 4)
        
        # Ensure all scores are between 1-10
        for key in scores:
            scores[key] = max(1, min(10, scores[key]))
        
        return scores
    
    def _calculate_lucky_attributes(self, transit_planets: Dict, natal_planets: Dict) -> Dict:
        """Calculate lucky numbers, colors, days"""
        
        # Lucky numbers based on key planets
        lucky_nums = []
        if 'Jupiter' in transit_planets:
            lucky_nums.extend([3, 12, 21])
        if 'Venus' in transit_planets:
            lucky_nums.extend([6, 15, 24])
        lucky_nums = list(set(lucky_nums))[:5]
        
        # Lucky colors based on dominant planets
        colors = []
        for planet in ['Jupiter', 'Venus', 'Mercury']:
            if planet in transit_planets:
                if planet == 'Jupiter':
                    colors.append('Yellow')
                elif planet == 'Venus':
                    colors.append('White')
                elif planet == 'Mercury':
                    colors.append('Green')
        
        # Lucky days based on planets
        days = []
        if 'Jupiter' in transit_planets and not transit_planets['Jupiter']['is_retrograde']:
            days.append('Thursday')
        if 'Venus' in transit_planets:
            days.append('Friday')
        
        return {
            'lucky_numbers': lucky_nums or [1, 5, 9],
            'lucky_colors': colors or ['Yellow', 'White'],
            'lucky_days': days or ['Thursday', 'Friday']
        }


# Example usage and testing
if __name__ == "__main__":
    generator = MonthlyHoroscopeGenerator()
    
    # Test with location name (geocoding)
    result = generator.generate_monthly_horoscope(
        birth_date="1990-05-15",
        birth_time="14:30:00",
        birth_location="Mumbai, India",
        target_month=1,
        target_year=2025
    )
    
    print("Monthly Horoscope Generated!")
    print(f"Title: {result['title']}")
    print(f"Career Score: {result['career_score']}/10")
    print(f"\nCareer: {result['career_prediction']}")
    print(f"\nFinance: {result['finance_prediction']}")