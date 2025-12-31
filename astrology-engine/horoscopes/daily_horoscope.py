# astrology-engine/calculations/daily_horoscope_generator.py
# Daily Horoscope Generator with Moon transits and hourly predictions

from datetime import datetime, timedelta
from typing import Dict, Optional
from calculations.base_calculator import BaseCalculator
import calendar

class DailyHoroscopeGenerator(BaseCalculator):
    """
    Generate daily horoscope based on:
    1. Moon's transit (most important for daily)
    2. Sun's house position
    3. Fast-moving planets (Mercury, Venus, Mars)
    4. Daily tithi, nakshatra
    5. Hora (hourly rulership)
    """
    
    HOUSE_MEANINGS = {
        1: {'area': 'self', 'daily': 'Focus on self-care and personal energy today.'},
        2: {'area': 'finance', 'daily': 'Financial matters and family interactions are highlighted.'},
        3: {'area': 'communication', 'daily': 'Communication and short trips take center stage.'},
        4: {'area': 'home', 'daily': 'Home, emotions, and mother-related matters are important.'},
        5: {'area': 'creativity', 'daily': 'Creative pursuits and romance bring joy.'},
        6: {'area': 'health', 'daily': 'Health, service, and daily work require attention.'},
        7: {'area': 'relationships', 'daily': 'Partnerships and one-on-one interactions are key.'},
        8: {'area': 'transformation', 'daily': 'Deep matters and transformative experiences arise.'},
        9: {'area': 'fortune', 'daily': 'Luck, learning, and spiritual growth are favored.'},
        10: {'area': 'career', 'daily': 'Career and public image are in focus.'},
        11: {'area': 'gains', 'daily': 'Social connections and gains are highlighted.'},
        12: {'area': 'losses', 'daily': 'Introspection and spiritual activities are beneficial.'}
    }
    
    def __init__(self):
        """Initialize daily horoscope generator"""
        super().__init__()
    
    def generate_daily_horoscope(
        self,
        birth_date: str,
        birth_time: str,
        birth_location: str = None,
        latitude: float = None,
        longitude: float = None,
        timezone: str = None,
        target_date: str = None
    ) -> Dict:
        """
        Generate complete daily horoscope
        
        Args:
            birth_date: 'YYYY-MM-DD'
            birth_time: 'HH:MM:SS'
            birth_location: Location name (if lat/lon not provided)
            latitude: Birth latitude (optional)
            longitude: Birth longitude (optional)
            timezone: Timezone (optional)
            target_date: Date for horoscope 'YYYY-MM-DD' (default: today)
        
        Returns:
            Complete daily horoscope dict
        """
        
        # Handle geocoding
        geo_data = self.handle_geocoding(birth_location, latitude, longitude, timezone)
        latitude = geo_data['latitude']
        longitude = geo_data['longitude']
        timezone = geo_data['timezone']
        
        # Parse birth datetime
        birth_datetime = self.parse_birth_datetime(birth_date, birth_time)
        
        # Set target date (default: today)
        if target_date:
            target_dt = datetime.strptime(target_date, "%Y-%m-%d")
        else:
            target_dt = datetime.now()
        
        # Set time to noon for daily calculations
        target_dt = target_dt.replace(hour=12, minute=0, second=0)
        
        # Period for the day
        period_start = target_dt.replace(hour=0, minute=0, second=0)
        period_end = target_dt.replace(hour=23, minute=59, second=59)
        
        # Calculate natal chart
        birth_jd = self.calculate_julian_day(birth_datetime)
        natal_ascendant = self.calculate_ascendant(birth_jd, latitude, longitude)
        natal_planets = self.get_all_planets(birth_jd)
        
        # Calculate transits for target day
        transit_jd = self.calculate_julian_day(target_dt)
        transit_planets = self.get_all_planets(transit_jd)
        
        # Moon's nakshatra (important for daily)
        moon_nakshatra = self.calculate_nakshatra(transit_planets['Moon']['longitude'])
        
        # Analyze transits
        transit_analysis = self._analyze_daily_transits(
            transit_planets,
            natal_ascendant['longitude']
        )
        
        # Generate predictions
        predictions = self._generate_daily_predictions(
            transit_analysis,
            natal_planets,
            transit_planets,
            moon_nakshatra
        )
        
        # Calculate scores (1-10)
        scores = self._calculate_daily_scores(transit_analysis, transit_planets)
        
        # Get day name
        day_name = calendar.day_name[target_dt.weekday()]
        
        # Calculate auspicious/inauspicious times
        timings = self._calculate_daily_timings(target_dt, transit_jd)
        
        return {
            'horoscope_type': 'daily',
            'period_start': period_start.isoformat(),
            'period_end': period_end.isoformat(),
            'title': f"Daily Horoscope - {target_dt.strftime('%B %d, %Y')}",
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
            'lucky_days': [day_name],
            'lucky_direction': predictions['lucky_direction'],
            
            # Daily specifics
            'moon_sign': transit_planets['Moon']['sign'],
            'moon_nakshatra': moon_nakshatra['name'],
            'sunrise_moon_phase': self._get_moon_phase(transit_planets),
            
            # Timings
            'auspicious_times': timings['auspicious'],
            'inauspicious_times': timings['inauspicious'],
            
            # Planetary transits
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
            'birth_location': geo_data['location'],
            'natal_ascendant': natal_ascendant['sign'],
            'natal_moon_sign': natal_planets['Moon']['sign']
        }
    
    def _analyze_daily_transits(self, transit_planets: Dict, asc_longitude: float) -> Dict:
        """Analyze planetary transits for the day"""
        analysis = {}
        
        for planet, data in transit_planets.items():
            house = self.calculate_house_from_ascendant(data['longitude'], asc_longitude)
            
            analysis[planet] = {
                'house': house,
                'sign': data['sign'],
                'is_retrograde': data['is_retrograde'],
                'strength': self.calculate_planet_strength_simple(data)
            }
        
        return analysis
    
    def _generate_daily_predictions(
        self,
        transit_analysis: Dict,
        natal_planets: Dict,
        transit_planets: Dict,
        moon_nakshatra: Dict
    ) -> Dict:
        """Generate text predictions for each life area"""
        
        # Moon's house is most important for daily predictions
        moon_house = transit_analysis['Moon']['house']
        moon_house_info = self.HOUSE_MEANINGS[moon_house]
        
        # Generate predictions
        career = self._predict_daily_career(transit_analysis)
        finance = self._predict_daily_finance(transit_analysis, moon_house)
        relationship = self._predict_daily_relationship(transit_analysis, moon_nakshatra)
        health = self._predict_daily_health(transit_analysis)
        
        # Summary based on Moon
        summary = f"Today, the Moon transits your {moon_house}th house in {transit_planets['Moon']['sign']}, making it a day focused on {moon_house_info['area']}. {moon_house_info['daily']}"
        
        # Detailed
        detailed = f"{summary}\n\n{career}\n\n{finance}\n\n{relationship}\n\n{health}"
        
        # Lucky attributes based on Moon nakshatra lord
        lucky = self._calculate_daily_lucky_attributes(moon_nakshatra, transit_planets)
        
        return {
            'summary': summary,
            'detailed': detailed,
            'career': career,
            'finance': finance,
            'relationship': relationship,
            'health': health,
            **lucky
        }
    
    def _predict_daily_career(self, transit_analysis: Dict) -> str:
        """Generate daily career prediction"""
        predictions = []
        
        # Sun's position (authority)
        sun_house = transit_analysis['Sun']['house']
        if sun_house == 10:
            predictions.append("Sun in 10th house brings recognition at work today.")
        elif sun_house in [1, 11]:
            predictions.append("Good day for career initiatives and networking.")
        elif sun_house in [6, 8, 12]:
            predictions.append("Work may feel challenging. Stay focused and persistent.")
        
        # Mercury (communication at work)
        if 'Mercury' in transit_analysis:
            merc_house = transit_analysis['Mercury']['house']
            if merc_house == 10:
                predictions.append("Mercury enhances communication with superiors.")
            elif transit_analysis['Mercury']['is_retrograde']:
                predictions.append("Double-check work communications due to Mercury retrograde.")
        
        if not predictions:
            predictions.append("Steady progress at work. Maintain your routine.")
        
        return " ".join(predictions)
    
    def _predict_daily_finance(self, transit_analysis: Dict, moon_house: int) -> str:
        """Generate daily finance prediction"""
        predictions = []
        
        # Moon in 2nd or 11th house (money houses)
        if moon_house == 2:
            predictions.append("Moon in 2nd house makes it a good day for financial planning.")
        elif moon_house == 11:
            predictions.append("Moon in 11th house brings opportunities for income gains.")
        elif moon_house == 12:
            predictions.append("Moon in 12th house suggests controlling unnecessary expenses today.")
        
        # Venus (luxury/spending)
        if 'Venus' in transit_analysis:
            venus_house = transit_analysis['Venus']['house']
            if venus_house in [2, 11]:
                predictions.append("Venus supports financial comfort today.")
            elif venus_house == 12:
                predictions.append("Be mindful of impulse purchases.")
        
        if not predictions:
            predictions.append("Maintain balanced spending habits today.")
        
        return " ".join(predictions)
    
    def _predict_daily_relationship(self, transit_analysis: Dict, moon_nakshatra: Dict) -> str:
        """Generate daily relationship prediction"""
        predictions = []
        
        # Moon's nakshatra affects emotions
        nak_lord = moon_nakshatra['lord']
        if nak_lord == 'Venus':
            predictions.append("Moon in Venus nakshatra brings harmony in relationships.")
        elif nak_lord == 'Mars':
            predictions.append("Moon in Mars nakshatra may create emotional intensity. Communicate gently.")
        elif nak_lord in ['Jupiter', 'Moon']:
            predictions.append("Favorable day for emotional bonding and understanding.")
        
        # Venus position
        if 'Venus' in transit_analysis:
            venus_house = transit_analysis['Venus']['house']
            if venus_house in [1, 5, 7]:
                predictions.append("Venus position supports romance and partnership harmony.")
            elif venus_house in [6, 8, 12]:
                predictions.append("Practice patience and empathy in relationships today.")
        
        if not predictions:
            predictions.append("Day calls for open communication with loved ones.")
        
        return " ".join(predictions)
    
    def _predict_daily_health(self, transit_analysis: Dict) -> str:
        """Generate daily health prediction"""
        predictions = []
        
        # Moon affects daily health and mood
        moon_house = transit_analysis['Moon']['house']
        if moon_house == 1:
            predictions.append("Moon in ascendant boosts vitality and emotional well-being.")
        elif moon_house == 6:
            predictions.append("Moon in 6th house requires attention to digestive health.")
        elif moon_house == 8:
            predictions.append("Take extra care of your health today. Avoid stress.")
        
        # Mars (energy/accidents)
        if 'Mars' in transit_analysis:
            mars_house = transit_analysis['Mars']['house']
            if mars_house == 6:
                predictions.append("Mars gives good energy to overcome health issues.")
            elif mars_house in [1, 8]:
                predictions.append("Be cautious to avoid minor injuries or accidents.")
        
        if not predictions:
            predictions.append("Maintain regular health routines. Stay hydrated.")
        
        return " ".join(predictions)
    
    def _calculate_daily_scores(self, transit_analysis: Dict, transit_planets: Dict) -> Dict:
        """Calculate 1-10 scores for each area"""
        scores = {
            'overall': 5,
            'career': 5,
            'finance': 5,
            'relationship': 5,
            'health': 5
        }
        
        # Moon's position is most important for daily
        moon_house = transit_analysis['Moon']['house']
        
        # Career score
        if transit_analysis['Sun']['house'] in [1, 10, 11]:
            scores['career'] += 2
        if moon_house in [6, 8, 12]:
            scores['career'] -= 1
        
        # Finance score
        if moon_house in [2, 11]:
            scores['finance'] += 2
        elif moon_house == 12:
            scores['finance'] -= 1
        if 'Venus' in transit_analysis and transit_analysis['Venus']['house'] in [2, 11]:
            scores['finance'] += 1
        
        # Relationship score
        if 'Venus' in transit_analysis and transit_analysis['Venus']['house'] in [1, 5, 7]:
            scores['relationship'] += 2
        if moon_house in [4, 7]:
            scores['relationship'] += 1
        
        # Health score
        if moon_house == 1:
            scores['health'] += 2
        elif moon_house in [6, 8]:
            scores['health'] -= 1
        if 'Mars' in transit_analysis and transit_analysis['Mars']['house'] == 6:
            scores['health'] += 1
        
        # Overall as average
        scores['overall'] = round((
            scores['career'] + 
            scores['finance'] + 
            scores['relationship'] + 
            scores['health']
        ) / 4)
        
        # Ensure 1-10 range
        for key in scores:
            scores[key] = max(1, min(10, scores[key]))
        
        return scores
    
    def _calculate_daily_lucky_attributes(self, moon_nakshatra: Dict, transit_planets: Dict) -> Dict:
        """Calculate daily lucky attributes based on Moon nakshatra"""
        
        nak_lord = moon_nakshatra['lord']
        
        # Lucky numbers based on nakshatra lord
        lucky_numbers = {
            'Sun': [1, 10, 19],
            'Moon': [2, 11, 20],
            'Mars': [9, 18, 27],
            'Mercury': [5, 14, 23],
            'Jupiter': [3, 12, 21],
            'Venus': [6, 15, 24],
            'Saturn': [8, 17, 26],
            'Rahu': [4, 13, 22],
            'Ketu': [7, 16, 25]
        }
        
        # Lucky colors based on nakshatra lord
        lucky_colors = {
            'Sun': ['Gold', 'Orange'],
            'Moon': ['White', 'Silver'],
            'Mars': ['Red', 'Maroon'],
            'Mercury': ['Green', 'Emerald'],
            'Jupiter': ['Yellow', 'Gold'],
            'Venus': ['White', 'Pink'],
            'Saturn': ['Black', 'Blue'],
            'Rahu': ['Smoky', 'Grey'],
            'Ketu': ['Brown', 'Grey']
        }
        
        # Lucky direction based on Moon sign
        moon_sign = transit_planets['Moon']['sign']
        directions = {
            'Aries': 'East', 'Taurus': 'South-East', 'Gemini': 'South',
            'Cancer': 'North', 'Leo': 'East', 'Virgo': 'South',
            'Libra': 'West', 'Scorpio': 'North', 'Sagittarius': 'North-East',
            'Capricorn': 'South-West', 'Aquarius': 'West', 'Pisces': 'North'
        }
        
        return {
            'lucky_numbers': lucky_numbers.get(nak_lord, [1, 5, 9]),
            'lucky_colors': lucky_colors.get(nak_lord, ['White', 'Yellow']),
            'lucky_direction': directions.get(moon_sign, 'East')
        }
    
    def _calculate_daily_timings(self, target_dt: datetime, jd: float) -> Dict:
        """Calculate auspicious and inauspicious times for the day"""
        
        # Simplified calculation - can be enhanced with actual hora calculations
        sunrise = target_dt.replace(hour=6, minute=0)
        sunset = target_dt.replace(hour=18, minute=0)
        
        # Rahu Kaal (inauspicious time) - varies by day
        weekday = target_dt.weekday()
        rahu_kaal_start_hours = [16.5, 15, 13.5, 12, 10.5, 9, 7.5, 16.5]  # Mon-Sun
        rahu_start_hour = rahu_kaal_start_hours[weekday]
        
        rahu_start = target_dt.replace(hour=int(rahu_start_hour), minute=int((rahu_start_hour % 1) * 60))
        rahu_end = rahu_start + timedelta(minutes=90)
        
        # Abhijit Muhurat (auspicious) - 24 minutes around noon
        abhijit_start = target_dt.replace(hour=11, minute=48)
        abhijit_end = target_dt.replace(hour=12, minute=12)
        
        return {
            'auspicious': [
                {
                    'name': 'Abhijit Muhurat',
                    'start': abhijit_start.strftime('%H:%M'),
                    'end': abhijit_end.strftime('%H:%M'),
                    'description': 'Most auspicious time of the day'
                },
                {
                    'name': 'Morning Hours',
                    'start': '06:00',
                    'end': '09:00',
                    'description': 'Good for spiritual activities'
                }
            ],
            'inauspicious': [
                {
                    'name': 'Rahu Kaal',
                    'start': rahu_start.strftime('%H:%M'),
                    'end': rahu_end.strftime('%H:%M'),
                    'description': 'Avoid starting new ventures'
                }
            ]
        }
    
    def _get_moon_phase(self, transit_planets: Dict) -> str:
        """Determine Moon phase based on Sun-Moon angle"""
        sun_lon = transit_planets['Sun']['longitude']
        moon_lon = transit_planets['Moon']['longitude']
        
        angle = (moon_lon - sun_lon) % 360
        
        if angle < 45:
            return 'New Moon'
        elif angle < 90:
            return 'Waxing Crescent'
        elif angle < 135:
            return 'First Quarter'
        elif angle < 180:
            return 'Waxing Gibbous'
        elif angle < 225:
            return 'Full Moon'
        elif angle < 270:
            return 'Waning Gibbous'
        elif angle < 315:
            return 'Last Quarter'
        else:
            return 'Waning Crescent'


# Example usage
if __name__ == "__main__":
    generator = DailyHoroscopeGenerator()
    
    result = generator.generate_daily_horoscope(
        birth_date="1990-05-15",
        birth_time="14:30:00",
        birth_location="Mumbai, India",
        target_date="2025-01-15"
    )
    
    print("Daily Horoscope Generated!")
    print(f"Title: {result['title']}")
    print(f"Overall Score: {result['overall_score']}/10")
    print(f"\nSummary: {result['summary']}")
    print(f"\nMoon in: {result['moon_sign']} - {result['moon_nakshatra']}")