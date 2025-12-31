# astrology-engine/calculations/yearly_horoscope_generator.py
# Yearly Horoscope Generator with quarterly breakdown

from datetime import datetime, timedelta
from typing import Dict, Optional, List
from calculations.base_calculator import BaseCalculator
import calendar

class YearlyHoroscopeGenerator(BaseCalculator):
    """
    Generate yearly horoscope based on:
    1. Jupiter transit (annual cycle)
    2. Saturn transit (2.5 year cycle)
    3. Solar Return chart
    4. Major dasha periods
    5. Quarterly breakdown
    """
    
    QUARTERS = {
        1: {'months': [1, 2, 3], 'name': 'Q1 (Jan-Mar)', 'season': 'Winter/Spring'},
        2: {'months': [4, 5, 6], 'name': 'Q2 (Apr-Jun)', 'season': 'Spring/Summer'},
        3: {'months': [7, 8, 9], 'name': 'Q3 (Jul-Sep)', 'season': 'Summer/Monsoon'},
        4: {'months': [10, 11, 12], 'name': 'Q4 (Oct-Dec)', 'season': 'Autumn/Winter'}
    }
    
    def __init__(self):
        """Initialize yearly horoscope generator"""
        super().__init__()
    
    def generate_yearly_horoscope(
        self,
        birth_date: str,
        birth_time: str,
        birth_location: str = None,
        latitude: float = None,
        longitude: float = None,
        timezone: str = None,
        target_year: int = None
    ) -> Dict:
        """
        Generate complete yearly horoscope with quarterly breakdown
        
        Args:
            birth_date: 'YYYY-MM-DD'
            birth_time: 'HH:MM:SS'
            birth_location: Location name (if lat/lon not provided)
            latitude: Birth latitude (optional)
            longitude: Birth longitude (optional)
            timezone: Timezone (optional)
            target_year: Year for horoscope (default: current year)
        
        Returns:
            Complete yearly horoscope dict with quarterly predictions
        """
        
        # Handle geocoding
        geo_data = self.handle_geocoding(birth_location, latitude, longitude, timezone)
        latitude = geo_data['latitude']
        longitude = geo_data['longitude']
        timezone = geo_data['timezone']
        
        # Parse birth datetime
        birth_datetime = self.parse_birth_datetime(birth_date, birth_time)
        
        # Set target year
        if target_year is None:
            target_year = datetime.now().year
        
        # Year period
        period_start = datetime(target_year, 1, 1, 0, 0, 0)
        period_end = datetime(target_year, 12, 31, 23, 59, 59)
        
        # Calculate natal chart
        birth_jd = self.calculate_julian_day(birth_datetime)
        natal_ascendant = self.calculate_ascendant(birth_jd, latitude, longitude)
        natal_planets = self.get_all_planets(birth_jd)
        
        # Calculate transits at year start
        year_start_jd = self.calculate_julian_day(period_start)
        year_start_planets = self.get_all_planets(year_start_jd)
        
        # Analyze Jupiter & Saturn (slow-moving, define yearly themes)
        jupiter_analysis = self._analyze_jupiter_year(
            year_start_planets['Jupiter'],
            natal_ascendant['longitude']
        )
        
        saturn_analysis = self._analyze_saturn_year(
            year_start_planets['Saturn'],
            natal_ascendant['longitude'],
            natal_planets['Moon']['sign_num']
        )
        
        # Generate quarterly predictions
        quarters = self._generate_quarterly_predictions(
            target_year,
            latitude,
            longitude,
            natal_ascendant,
            natal_planets
        )
        
        # Generate annual predictions
        predictions = self._generate_yearly_predictions(
            jupiter_analysis,
            saturn_analysis,
            quarters,
            year_start_planets,
            natal_planets
        )
        
        # Calculate yearly scores
        scores = self._calculate_yearly_scores(
            jupiter_analysis,
            saturn_analysis,
            quarters
        )
        
        # Major events to watch
        important_dates = self._identify_important_dates(
            target_year,
            natal_planets,
            year_start_planets
        )
        
        return {
            'horoscope_type': 'yearly',
            'period_start': period_start.isoformat(),
            'period_end': period_end.isoformat(),
            'title': f"Yearly Horoscope {target_year}",
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
            
            # Quarterly breakdown
            'quarterly_predictions': quarters,
            
            # Major themes
            'jupiter_theme': jupiter_analysis['theme'],
            'saturn_theme': saturn_analysis['theme'],
            'key_opportunities': predictions['opportunities'],
            'key_challenges': predictions['challenges'],
            
            # Important dates
            'important_dates': important_dates,
            
            # Lucky attributes (annual)
            'lucky_numbers': predictions['lucky_numbers'],
            'lucky_colors': predictions['lucky_colors'],
            'lucky_months': predictions['lucky_months'],
            
            # Planetary transits (year overview)
            'planetary_transits': {
                'Jupiter': {
                    'sign': year_start_planets['Jupiter']['sign'],
                    'house': jupiter_analysis['house'],
                    'is_retrograde': year_start_planets['Jupiter']['is_retrograde']
                },
                'Saturn': {
                    'sign': year_start_planets['Saturn']['sign'],
                    'house': saturn_analysis['house'],
                    'is_retrograde': year_start_planets['Saturn']['is_retrograde'],
                    'sade_sati': saturn_analysis['sade_sati']
                }
            },
            
            # Metadata
            'generated_by': 'ai',
            'ai_model_used': 'Swiss Ephemeris + Vedic Rules',
            'calculation_method': 'Swiss Ephemeris',
            'ayanamsa': 'Lahiri',
            
            # Birth data
            'birth_location': geo_data['location'],
            'natal_ascendant': natal_ascendant['sign'],
            'natal_moon_sign': natal_planets['Moon']['sign']
        }
    
    def _analyze_jupiter_year(self, jupiter: Dict, asc_lon: float) -> Dict:
        """Analyze Jupiter's yearly influence"""
        house = self.calculate_house_from_ascendant(jupiter['longitude'], asc_lon)
        
        themes = {
            1: {'theme': 'Personal growth and new beginnings', 'focus': 'self-development'},
            2: {'theme': 'Financial expansion and family growth', 'focus': 'wealth building'},
            3: {'theme': 'Communication and skill development', 'focus': 'learning'},
            4: {'theme': 'Property and emotional fulfillment', 'focus': 'home life'},
            5: {'theme': 'Creativity and children', 'focus': 'romance and speculation'},
            6: {'theme': 'Service and health improvement', 'focus': 'overcoming obstacles'},
            7: {'theme': 'Partnerships and marriage', 'focus': 'relationships'},
            8: {'theme': 'Transformation and research', 'focus': 'deep changes'},
            9: {'theme': 'Fortune and higher learning', 'focus': 'luck and spirituality'},
            10: {'theme': 'Career advancement and recognition', 'focus': 'professional growth'},
            11: {'theme': 'Goals achievement and income growth', 'focus': 'gains and networks'},
            12: {'theme': 'Spirituality and foreign connections', 'focus': 'liberation'}
        }
        
        house_info = themes.get(house, themes[1])
        
        return {
            'house': house,
            'sign': jupiter['sign'],
            'theme': house_info['theme'],
            'focus': house_info['focus'],
            'is_beneficial': house in [1, 2, 5, 7, 9, 10, 11]
        }
    
    def _analyze_saturn_year(self, saturn: Dict, asc_lon: float, moon_sign: int) -> Dict:
        """Analyze Saturn's yearly influence including Sade Sati"""
        house = self.calculate_house_from_ascendant(saturn['longitude'], asc_lon)
        saturn_sign = saturn['sign_num']
        
        # Check Sade Sati (Saturn in 12th, 1st, or 2nd from Moon)
        sade_sati = {
            'in_sade_sati': False,
            'phase': None
        }
        
        phase_1 = (moon_sign - 1) if moon_sign > 1 else 12  # 12th from Moon
        phase_2 = moon_sign  # On Moon
        phase_3 = (moon_sign % 12) + 1  # 2nd from Moon
        
        if saturn_sign == phase_1:
            sade_sati = {'in_sade_sati': True, 'phase': 1, 'description': 'Rising Phase'}
        elif saturn_sign == phase_2:
            sade_sati = {'in_sade_sati': True, 'phase': 2, 'description': 'Peak Phase'}
        elif saturn_sign == phase_3:
            sade_sati = {'in_sade_sati': True, 'phase': 3, 'description': 'Setting Phase'}
        
        themes = {
            1: 'Discipline in personal life',
            2: 'Financial caution required',
            3: 'Effort in communication',
            4: 'Responsibility at home',
            5: 'Patience with children',
            6: 'Victory over enemies',
            7: 'Maturity in relationships',
            8: 'Deep transformation',
            9: 'Spiritual discipline',
            10: 'Hard work brings success',
            11: 'Delayed but stable gains',
            12: 'Spiritual growth through detachment'
        }
        
        return {
            'house': house,
            'sign': saturn['sign'],
            'theme': themes.get(house, 'Discipline and patience'),
            'sade_sati': sade_sati,
            'requires_patience': True
        }
    
    def _generate_quarterly_predictions(
        self,
        year: int,
        latitude: float,
        longitude: float,
        natal_ascendant: Dict,
        natal_planets: Dict
    ) -> List[Dict]:
        """Generate predictions for each quarter"""
        quarters = []
        
        for q_num, q_info in self.QUARTERS.items():
            # Mid-month of quarter for calculations
            mid_month = q_info['months'][1]
            mid_date = datetime(year, mid_month, 15, 12, 0, 0)
            
            # Calculate transits
            jd = self.calculate_julian_day(mid_date)
            transit_planets = self.get_all_planets(jd)
            
            # Analyze quarter
            quarter_analysis = self._analyze_quarter(
                transit_planets,
                natal_ascendant,
                natal_planets
            )
            
            quarters.append({
                'quarter': q_num,
                'name': q_info['name'],
                'season': q_info['season'],
                'months': q_info['months'],
                'summary': quarter_analysis['summary'],
                'career': quarter_analysis['career'],
                'finance': quarter_analysis['finance'],
                'relationship': quarter_analysis['relationship'],
                'health': quarter_analysis['health'],
                'key_planet': quarter_analysis['key_planet'],
                'overall_score': quarter_analysis['score']
            })
        
        return quarters
    
    def _analyze_quarter(
        self,
        transit_planets: Dict,
        natal_ascendant: Dict,
        natal_planets: Dict
    ) -> Dict:
        """Analyze a specific quarter"""
        
        # Identify key planet for quarter
        key_planets = []
        for planet in ['Mars', 'Mercury', 'Venus']:
            house = self.calculate_house_from_ascendant(
                transit_planets[planet]['longitude'],
                natal_ascendant['longitude']
            )
            if house in [1, 5, 9, 10, 11]:
                key_planets.append(planet)
        
        key_planet = key_planets[0] if key_planets else 'Sun'
        
        # Generate predictions
        jupiter_house = self.calculate_house_from_ascendant(
            transit_planets['Jupiter']['longitude'],
            natal_ascendant['longitude']
        )
        
        career = "Focus on steady progress. " + (
            "Jupiter supports career growth." if jupiter_house in [1, 10, 11] 
            else "Maintain consistent efforts."
        )
        
        finance = "Manage finances wisely. " + (
            "Jupiter brings financial opportunities." if jupiter_house in [2, 11]
            else "Practice saving and budgeting."
        )
        
        relationship = "Nurture relationships. " + (
            "Venus supports harmony." if self.calculate_house_from_ascendant(
                transit_planets['Venus']['longitude'],
                natal_ascendant['longitude']
            ) in [1, 5, 7] else "Communicate openly."
        )
        
        health = "Maintain healthy routines. Regular exercise and balanced diet recommended."
        
        summary = f"This quarter emphasizes {key_planet}'s influence. "
        if jupiter_house in [1, 5, 9, 10, 11]:
            summary += "Jupiter's favorable position brings opportunities."
        else:
            summary += "Stay persistent with your efforts."
        
        # Score based on Jupiter position
        score = 6 if jupiter_house in [1, 5, 9, 10, 11] else 5
        
        return {
            'summary': summary,
            'career': career,
            'finance': finance,
            'relationship': relationship,
            'health': health,
            'key_planet': key_planet,
            'score': score
        }
    
    def _generate_yearly_predictions(
        self,
        jupiter_analysis: Dict,
        saturn_analysis: Dict,
        quarters: List[Dict],
        year_start_planets: Dict,
        natal_planets: Dict
    ) -> Dict:
        """Generate comprehensive yearly predictions"""
        
        # Career
        career_parts = []
        if jupiter_analysis['house'] in [1, 10, 11]:
            career_parts.append(f"Jupiter in {jupiter_analysis['house']}th house brings significant career opportunities throughout the year.")
        else:
            career_parts.append("Career progress requires consistent effort this year.")
        
        if saturn_analysis['sade_sati']['in_sade_sati']:
            career_parts.append(f"Saturn's Sade Sati (Phase {saturn_analysis['sade_sati']['phase']}) demands hard work and patience.")
        
        career = " ".join(career_parts)
        
        # Finance
        finance_parts = []
        if jupiter_analysis['house'] in [2, 11]:
            finance_parts.append(f"Jupiter transiting your {jupiter_analysis['house']}th house indicates strong financial growth potential.")
        else:
            finance_parts.append("Financial stability through careful planning is emphasized.")
        
        finance = " ".join(finance_parts)
        
        # Relationship
        relationship = "The year brings opportunities for deepening relationships. "
        if jupiter_analysis['house'] == 7:
            relationship += "Jupiter in 7th house is excellent for marriage and partnerships."
        elif saturn_analysis['house'] == 7:
            relationship += "Saturn in 7th house brings maturity and commitment in relationships."
        else:
            relationship += "Focus on open communication and understanding."
        
        # Health
        health = "Overall health remains stable with regular care. "
        if saturn_analysis['sade_sati']['in_sade_sati']:
            health += "Pay extra attention to health during Sade Sati period. Regular check-ups advised."
        else:
            health += "Maintain preventive health measures and balanced lifestyle."
        
        # Summary
        summary = f"The year {year_start_planets['Sun']['sign_num']} is defined by {jupiter_analysis['theme']}. "
        if saturn_analysis['sade_sati']['in_sade_sati']:
            summary += f"Saturn's Sade Sati brings challenges that lead to personal growth. "
        summary += "Overall, a year of steady progress with strategic planning."
        
        # Detailed
        detailed = f"{summary}\n\n{career}\n\n{finance}\n\n{relationship}\n\n{health}"
        
        # Opportunities and Challenges
        opportunities = []
        if jupiter_analysis['is_beneficial']:
            opportunities.append(f"{jupiter_analysis['focus'].capitalize()} brings major opportunities")
        
        challenges = []
        if saturn_analysis['sade_sati']['in_sade_sati']:
            challenges.append(f"Sade Sati Phase {saturn_analysis['sade_sati']['phase']} requires patience")
        if not jupiter_analysis['is_beneficial']:
            challenges.append("Extra effort needed in key life areas")
        
        # Lucky attributes
        lucky_numbers = [3, 6, 9, 12, 21]  # Jupiter's numbers
        lucky_colors = ['Yellow', 'Gold', 'Orange']
        
        # Lucky months (when Jupiter is most favorable)
        lucky_months = []
        for q in quarters:
            if q['overall_score'] >= 6:
                lucky_months.extend([calendar.month_name[m] for m in q['months']])
        
        return {
            'summary': summary,
            'detailed': detailed,
            'career': career,
            'finance': finance,
            'relationship': relationship,
            'health': health,
            'opportunities': opportunities if opportunities else ['Steady progress in all areas'],
            'challenges': challenges if challenges else ['Maintain consistent efforts'],
            'lucky_numbers': lucky_numbers,
            'lucky_colors': lucky_colors,
            'lucky_months': lucky_months[:6] if lucky_months else ['All months']
        }
    
    def _calculate_yearly_scores(
        self,
        jupiter_analysis: Dict,
        saturn_analysis: Dict,
        quarters: List[Dict]
    ) -> Dict:
        """Calculate yearly scores based on major transits"""
        
        # Base scores
        scores = {
            'career': 5,
            'finance': 5,
            'relationship': 5,
            'health': 5
        }
        
        # Jupiter influence
        if jupiter_analysis['house'] in [1, 10, 11]:
            scores['career'] += 2
        if jupiter_analysis['house'] in [2, 11]:
            scores['finance'] += 3
        if jupiter_analysis['house'] in [5, 7]:
            scores['relationship'] += 2
        
        # Saturn influence (Sade Sati reduces scores)
        if saturn_analysis['sade_sati']['in_sade_sati']:
            phase = saturn_analysis['sade_sati']['phase']
            reduction = 2 if phase == 2 else 1  # Peak phase has more impact
            scores['career'] -= reduction
            scores['health'] -= reduction
        
        # Calculate overall from quarterly averages
        overall_from_quarters = sum(q['overall_score'] for q in quarters) / len(quarters)
        scores['overall'] = round(overall_from_quarters)
        
        # Ensure 1-10 range
        for key in scores:
            scores[key] = max(1, min(10, scores[key]))
        
        return scores
    
    def _identify_important_dates(
        self,
        year: int,
        natal_planets: Dict,
        year_start_planets: Dict
    ) -> List[Dict]:
        """Identify important dates in the year"""
        
        important = []
        
        # Birthday (Solar Return)
        important.append({
            'date': f"{year}-{datetime.now().month:02d}-{datetime.now().day:02d}",
            'event': 'Solar Return (Birthday)',
            'significance': 'New annual cycle begins. Good for new initiatives.'
        })
        
        # Jupiter transit changes (approximate)
        important.append({
            'date': f"{year}-05-01",
            'event': 'Jupiter mid-year position',
            'significance': 'Review progress and adjust strategies.'
        })
        
        # Saturn significant dates
        important.append({
            'date': f"{year}-08-15",
            'event': 'Saturn influence peak',
            'significance': 'Focus on discipline and long-term planning.'
        })
        
        return important


# Example usage
if __name__ == "__main__":
    generator = YearlyHoroscopeGenerator()
    
    result = generator.generate_yearly_horoscope(
        birth_date="1990-05-15",
        birth_time="14:30:00",
        birth_location="Mumbai, India",
        target_year=2025
    )
    
    print("Yearly Horoscope Generated!")
    print(f"Title: {result['title']}")
    print(f"Overall Score: {result['overall_score']}/10")
    print(f"\nJupiter Theme: {result['jupiter_theme']}")
    print(f"Saturn Theme: {result['saturn_theme']}")
    print(f"\nQ1 Score: {result['quarterly_predictions'][0]['overall_score']}/10")