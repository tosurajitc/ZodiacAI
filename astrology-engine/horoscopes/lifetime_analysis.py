# astrology-engine/calculations/lifetime_analysis_generator.py
# Lifetime Analysis Generator - Major life areas and Dasha periods

from datetime import datetime, timedelta
from typing import Dict, Optional, List
from base_calculator import BaseCalculator

class LifetimeAnalysisGenerator(BaseCalculator):
    """
    Generate lifetime analysis covering:
    1. Career trajectory and potential
    2. Financial prosperity periods
    3. Marriage and relationship patterns
    4. Health considerations
    5. Major Dasha periods (next 10-20 years)
    6. Life purpose and spiritual path
    """
    
    # Dasha sequence and durations
    DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
    DASHA_YEARS = {
        'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10, 'Mars': 7,
        'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17
    }
    
    NAKSHATRA_LORDS = [
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
    ] * 3  # 27 nakshatras, 9 lords repeated
    
    def __init__(self):
        """Initialize lifetime analysis generator"""
        super().__init__()
    
    def generate_lifetime_analysis(
        self,
        birth_date: str,
        birth_time: str,
        birth_location: str = None,
        latitude: float = None,
        longitude: float = None,
        timezone: str = None
    ) -> Dict:
        """
        Generate complete lifetime analysis
        
        Args:
            birth_date: 'YYYY-MM-DD'
            birth_time: 'HH:MM:SS'
            birth_location: Location name (if lat/lon not provided)
            latitude: Birth latitude (optional)
            longitude: Birth longitude (optional)
            timezone: Timezone (optional)
        
        Returns:
            Complete lifetime analysis dict
        """
        
        # Handle geocoding
        geo_data = self.handle_geocoding(birth_location, latitude, longitude, timezone)
        latitude = geo_data['latitude']
        longitude = geo_data['longitude']
        timezone = geo_data['timezone']
        
        # Parse birth datetime
        birth_datetime = self.parse_birth_datetime(birth_date, birth_time)
        
        # Calculate natal chart
        birth_jd = self.calculate_julian_day(birth_datetime)
        natal_ascendant = self.calculate_ascendant(birth_jd, latitude, longitude)
        natal_planets = self.get_all_planets(birth_jd)
        natal_houses = self.calculate_house_cusps(birth_jd, latitude, longitude)
        
        # Analyze birth chart for life themes
        chart_analysis = self._analyze_birth_chart(
            natal_planets,
            natal_ascendant,
            natal_houses
        )
        
        # Calculate Vimshottari Dasha periods
        dasha_analysis = self._calculate_dasha_periods(
            natal_planets['Moon']['longitude'],
            birth_datetime
        )
        
        # Generate life area predictions
        career_analysis = self._analyze_career_lifetime(natal_planets, natal_ascendant, chart_analysis)
        finance_analysis = self._analyze_finance_lifetime(natal_planets, natal_ascendant, chart_analysis)
        relationship_analysis = self._analyze_relationship_lifetime(natal_planets, chart_analysis)
        health_analysis = self._analyze_health_lifetime(natal_planets, natal_ascendant)
        
        # Calculate life purpose
        life_purpose = self._determine_life_purpose(natal_planets, natal_ascendant)
        
        # Generate scores for major life areas
        scores = self._calculate_lifetime_scores(chart_analysis, natal_planets)
        
        return {
            'horoscope_type': 'lifetime',
            'period_start': birth_datetime.isoformat(),
            'period_end': (birth_datetime + timedelta(days=365*80)).isoformat(),
            'title': 'Lifetime Analysis',
            'summary': self._generate_lifetime_summary(chart_analysis, dasha_analysis),
            'detailed_prediction': self._generate_detailed_lifetime(
                career_analysis,
                finance_analysis,
                relationship_analysis,
                health_analysis
            ),
            
            # Life area analyses
            'career_prediction': career_analysis['prediction'],
            'finance_prediction': finance_analysis['prediction'],
            'relationship_prediction': relationship_analysis['prediction'],
            'health_prediction': health_analysis['prediction'],
            
            # Scores (1-10)
            'overall_score': scores['overall'],
            'career_score': scores['career'],
            'finance_score': scores['finance'],
            'relationship_score': scores['relationship'],
            'health_score': scores['health'],
            
            # Life purpose and strengths
            'life_purpose': life_purpose['purpose'],
            'natural_talents': life_purpose['talents'],
            'key_strengths': chart_analysis['strengths'],
            'areas_for_growth': chart_analysis['challenges'],
            
            # Dasha periods (next 20 years)
            'major_dasha_periods': dasha_analysis['mahadashas'][:3],  # Next 3 major periods
            'current_dasha': dasha_analysis['current'],
            
            # Career specifics
            'career_best_fields': career_analysis['best_fields'],
            'career_peak_years': career_analysis['peak_periods'],
            'entrepreneurship_potential': career_analysis['entrepreneurship'],
            
            # Finance specifics
            'wealth_accumulation_periods': finance_analysis['prosperity_periods'],
            'investment_guidance': finance_analysis['investment_advice'],
            'financial_challenges': finance_analysis['challenges'],
            
            # Relationship specifics
            'marriage_timing': relationship_analysis['marriage_timing'],
            'partner_compatibility': relationship_analysis['partner_traits'],
            'relationship_challenges': relationship_analysis['challenges'],
            
            # Health specifics
            'health_sensitive_areas': health_analysis['sensitive_areas'],
            'health_precautions': health_analysis['precautions'],
            'longevity_indicators': health_analysis['longevity'],
            
            # Spiritual path
            'spiritual_inclinations': life_purpose['spiritual_path'],
            'karmic_lessons': chart_analysis['karmic_lessons'],
            
            # Birth chart details
            'natal_ascendant': natal_ascendant['sign'],
            'natal_moon_sign': natal_planets['Moon']['sign'],
            'natal_sun_sign': natal_planets['Sun']['sign'],
            'birth_nakshatra': self.calculate_nakshatra(natal_planets['Moon']['longitude'])['name'],
            
            # Yogas
            'beneficial_yogas': chart_analysis['yogas'],
            'doshas': chart_analysis['doshas'],
            
            # Metadata
            'generated_by': 'ai',
            'ai_model_used': 'Swiss Ephemeris + Vedic Rules',
            'calculation_method': 'Swiss Ephemeris',
            'ayanamsa': 'Lahiri',
            'birth_location': geo_data['location']
        }
    
    def _analyze_birth_chart(self, natal_planets: Dict, natal_ascendant: Dict, houses: List) -> Dict:
        """Comprehensive birth chart analysis"""
        
        strengths = []
        challenges = []
        yogas = []
        doshas = []
        karmic_lessons = []
        
        # Analyze Ascendant lord
        asc_sign = natal_ascendant['sign']
        
        # Analyze planet positions
        for planet, data in natal_planets.items():
            if planet in ['Rahu', 'Ketu']:
                continue
            
            strength = self.calculate_planet_strength_simple(data)
            
            if strength['strength'] > 70:
                strengths.append(f"{planet} is {strength['status']}, bringing natural abilities")
            elif strength['strength'] < 30:
                challenges.append(f"{planet} needs attention and strengthening")
        
        # Check for Raj Yoga (1st, 4th, 5th, 7th, 9th, 10th lord connections)
        if self._check_raj_yoga(natal_planets, natal_ascendant):
            yogas.append("Raj Yoga - Power and status in life")
        
        # Check for Dhana Yoga (wealth yoga)
        if self._check_dhana_yoga(natal_planets, natal_ascendant):
            yogas.append("Dhana Yoga - Wealth accumulation potential")
        
        # Check for Mangal Dosha
        if self._check_mangal_dosha(natal_planets, natal_ascendant):
            doshas.append("Mangal Dosha - Requires compatibility matching in marriage")
        
        # Karmic lessons from Saturn and Rahu/Ketu
        saturn_house = self.calculate_house_from_ascendant(
            natal_planets['Saturn']['longitude'],
            natal_ascendant['longitude']
        )
        karmic_lessons.append(f"Learning discipline and patience through {saturn_house}th house matters")
        
        return {
            'strengths': strengths if strengths else ['Balanced planetary influences'],
            'challenges': challenges if challenges else ['Minor growth areas'],
            'yogas': yogas if yogas else ['Standard combinations'],
            'doshas': doshas,
            'karmic_lessons': karmic_lessons
        }
    
    def _check_raj_yoga(self, planets: Dict, ascendant: Dict) -> bool:
        """Check for Raj Yoga (simplified)"""
        # Check if Jupiter or Venus is well-placed
        jupiter_house = self.calculate_house_from_ascendant(
            planets['Jupiter']['longitude'],
            ascendant['longitude']
        )
        
        return jupiter_house in [1, 4, 5, 7, 9, 10]
    
    def _check_dhana_yoga(self, planets: Dict, ascendant: Dict) -> bool:
        """Check for wealth yoga"""
        jupiter_house = self.calculate_house_from_ascendant(
            planets['Jupiter']['longitude'],
            ascendant['longitude']
        )
        venus_house = self.calculate_house_from_ascendant(
            planets['Venus']['longitude'],
            ascendant['longitude']
        )
        
        return jupiter_house in [2, 11] or venus_house in [2, 11]
    
    def _check_mangal_dosha(self, planets: Dict, ascendant: Dict) -> bool:
        """Check for Mangal Dosha"""
        mars_house = self.calculate_house_from_ascendant(
            planets['Mars']['longitude'],
            ascendant['longitude']
        )
        
        # Manglik if Mars in 1, 2, 4, 7, 8, 12
        return mars_house in [1, 2, 4, 7, 8, 12]
    
    def _calculate_dasha_periods(self, moon_lon: float, birth_date: datetime) -> Dict:
        """Calculate Vimshottari Dasha periods"""
        
        # Get birth nakshatra
        nakshatra_span = 360 / 27
        nakshatra_num = int(moon_lon / nakshatra_span)
        position_in_nak = (moon_lon % nakshatra_span) / nakshatra_span
        balance = 1 - position_in_nak
        
        # Get birth dasha lord
        birth_dasha_lord = self.NAKSHATRA_LORDS[nakshatra_num]
        
        # Calculate balance of birth dasha
        total_years = self.DASHA_YEARS[birth_dasha_lord]
        remaining_years = total_years * balance
        
        # Generate next 3 Mahadashas
        mahadashas = []
        current_date = birth_date
        start_index = self.DASHA_LORDS.index(birth_dasha_lord)
        
        for i in range(3):
            lord_index = (start_index + i) % 9
            lord = self.DASHA_LORDS[lord_index]
            years = self.DASHA_YEARS[lord] if i > 0 else remaining_years
            
            end_date = current_date + timedelta(days=int(years * 365.25))
            
            mahadashas.append({
                'lord': lord,
                'start_date': current_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'duration_years': round(years, 1),
                'theme': self._get_dasha_theme(lord)
            })
            
            current_date = end_date
        
        # Determine current dasha
        now = datetime.now()
        current_dasha = None
        for dasha in mahadashas:
            start = datetime.strptime(dasha['start_date'], '%Y-%m-%d')
            end = datetime.strptime(dasha['end_date'], '%Y-%m-%d')
            if start <= now <= end:
                current_dasha = dasha
                break
        
        return {
            'mahadashas': mahadashas,
            'current': current_dasha or mahadashas[0],
            'birth_dasha': birth_dasha_lord
        }
    
    def _get_dasha_theme(self, lord: str) -> str:
        """Get theme for each dasha lord"""
        themes = {
            'Sun': 'Authority, leadership, and recognition',
            'Moon': 'Emotions, intuition, and public connection',
            'Mars': 'Action, courage, and assertiveness',
            'Mercury': 'Communication, business, and intellectual growth',
            'Jupiter': 'Wisdom, expansion, and prosperity',
            'Venus': 'Relationships, creativity, and luxury',
            'Saturn': 'Discipline, hard work, and karmic lessons',
            'Rahu': 'Innovation, material success, and transformation',
            'Ketu': 'Spirituality, detachment, and inner growth'
        }
        return themes.get(lord, 'Personal development')
    
    def _analyze_career_lifetime(self, planets: Dict, ascendant: Dict, chart: Dict) -> Dict:
        """Analyze career trajectory"""
        
        # 10th house and lord analysis
        sun_house = self.calculate_house_from_ascendant(planets['Sun']['longitude'], ascendant['longitude'])
        jupiter_house = self.calculate_house_from_ascendant(planets['Jupiter']['longitude'], ascendant['longitude'])
        saturn_house = self.calculate_house_from_ascendant(planets['Saturn']['longitude'], ascendant['longitude'])
        
        # Determine best career fields
        best_fields = []
        
        # Based on 10th house planets
        if sun_house == 10:
            best_fields.extend(['Government', 'Administration', 'Leadership roles'])
        if jupiter_house == 10:
            best_fields.extend(['Teaching', 'Law', 'Finance', 'Advisory'])
        if saturn_house == 10:
            best_fields.extend(['Engineering', 'Research', 'Traditional business'])
        
        # Based on Mercury (communication)
        mercury_house = self.calculate_house_from_ascendant(planets['Mercury']['longitude'], ascendant['longitude'])
        if mercury_house in [1, 10]:
            best_fields.extend(['Writing', 'Sales', 'Technology'])
        
        if not best_fields:
            best_fields = ['Management', 'Business', 'Professional services']
        
        # Career peak periods (Jupiter and Sun transits)
        peak_periods = "Career peaks expected during Jupiter's transit through 10th house and during favorable Dasha periods"
        
        # Entrepreneurship potential
        entrepreneurship = "High" if jupiter_house in [1, 10, 11] else "Moderate to High"
        
        prediction = f"Career shows strong potential in {', '.join(best_fields[:3])}. "
        if 'Raj Yoga' in chart['yogas']:
            prediction += "Raj Yoga indicates rise to positions of authority. "
        prediction += f"Best suited for {best_fields[0].lower()} and related fields. {peak_periods}."
        
        return {
            'prediction': prediction,
            'best_fields': best_fields[:5],
            'peak_periods': peak_periods,
            'entrepreneurship': entrepreneurship
        }
    
    def _analyze_finance_lifetime(self, planets: Dict, ascendant: Dict, chart: Dict) -> Dict:
        """Analyze financial prospects"""
        
        jupiter_house = self.calculate_house_from_ascendant(planets['Jupiter']['longitude'], ascendant['longitude'])
        venus_house = self.calculate_house_from_ascendant(planets['Venus']['longitude'], ascendant['longitude'])
        
        prosperity_periods = []
        if jupiter_house in [2, 11]:
            prosperity_periods.append("Strong wealth accumulation throughout life")
        if 'Dhana Yoga' in chart['yogas']:
            prosperity_periods.append("Multiple sources of income after age 30")
        
        if not prosperity_periods:
            prosperity_periods = ["Steady financial growth with consistent effort"]
        
        investment_advice = "Jupiter's position suggests "
        if jupiter_house in [2, 5, 11]:
            investment_advice += "favorable results from long-term investments, real estate, and traditional assets."
        else:
            investment_advice += "conservative approach to investments with focus on savings."
        
        challenges = []
        if jupiter_house in [6, 8, 12]:
            challenges.append("Requires careful budgeting in certain periods")
        if not challenges:
            challenges = ["Minor financial fluctuations manageable with planning"]
        
        prediction = f"Financial prospects are {'strong' if jupiter_house in [2, 11] else 'stable'}. "
        prediction += f"{prosperity_periods[0]}. {investment_advice}"
        
        return {
            'prediction': prediction,
            'prosperity_periods': prosperity_periods,
            'investment_advice': investment_advice,
            'challenges': challenges
        }
    
    def _analyze_relationship_lifetime(self, planets: Dict, chart: Dict) -> Dict:
        """Analyze relationship and marriage"""
        
        venus_sign = planets['Venus']['sign']
        mars_sign = planets['Mars']['sign']
        
        # Marriage timing
        if 'Mangal Dosha' in chart['doshas']:
            timing = "Marriage after age 28 recommended for better compatibility"
        else:
            timing = "Marriage can happen between ages 24-30, favorable timing between 26-28"
        
        # Partner traits
        partner_traits = f"Partner likely to have {venus_sign} qualities - "
        partner_traits += "artistic and refined. " if venus_sign in ['Taurus', 'Libra', 'Pisces'] else "practical and grounded. "
        partner_traits += "Look for emotional compatibility and shared values."
        
        # Challenges
        challenges = []
        if 'Mangal Dosha' in chart['doshas']:
            challenges.append("Mangal Dosha requires compatible partner or remedies")
        if not challenges:
            challenges = ["Standard relationship adjustments needed"]
        
        prediction = f"Relationships are an important part of life journey. {timing}. "
        prediction += f"{partner_traits} Marriage brings growth and partnership support."
        
        return {
            'prediction': prediction,
            'marriage_timing': timing,
            'partner_traits': partner_traits,
            'challenges': challenges
        }
    
    def _analyze_health_lifetime(self, planets: Dict, ascendant: Dict) -> Dict:
        """Analyze health considerations"""
        
        mars_house = self.calculate_house_from_ascendant(planets['Mars']['longitude'], ascendant['longitude'])
        saturn_house = self.calculate_house_from_ascendant(planets['Saturn']['longitude'], ascendant['longitude'])
        
        sensitive_areas = []
        if mars_house in [1, 6, 8]:
            sensitive_areas.append("Blood pressure and inflammatory conditions")
        if saturn_house in [1, 6]:
            sensitive_areas.append("Bone health and chronic conditions")
        
        if not sensitive_areas:
            sensitive_areas = ["General wellness areas requiring routine care"]
        
        precautions = ["Regular health check-ups after age 40"]
        if saturn_house in [1, 6, 8]:
            precautions.append("Focus on joint health and mobility exercises")
        
        longevity = "Strong longevity indicators" if mars_house == 6 else "Good longevity with preventive care"
        
        prediction = f"Overall health is {'robust' if mars_house in [1, 6] else 'stable'}. "
        prediction += f"Pay attention to {sensitive_areas[0]}. {' '.join(precautions)}. {longevity}."
        
        return {
            'prediction': prediction,
            'sensitive_areas': sensitive_areas,
            'precautions': precautions,
            'longevity': longevity
        }
    
    def _determine_life_purpose(self, planets: Dict, ascendant: Dict) -> Dict:
        """Determine life purpose and spiritual path"""
        
        jupiter_sign = planets['Jupiter']['sign']
        sun_sign = planets['Sun']['sign']
        
        purpose = f"Life purpose centers around growth through {jupiter_sign} qualities - "
        if jupiter_sign in ['Sagittarius', 'Pisces']:
            purpose += "teaching, wisdom sharing, and spiritual guidance."
        elif jupiter_sign in ['Cancer']:
            purpose += "nurturing, caregiving, and emotional support to others."
        else:
            purpose += "practical service and systematic contribution to society."
        
        talents = ["Natural leadership abilities", "Strong communication skills"]
        
        spiritual_path = "Spiritual growth through "
        if jupiter_sign in ['Sagittarius', 'Pisces']:
            spiritual_path += "meditation, philosophy, and higher knowledge."
        else:
            spiritual_path += "karma yoga (service) and practical spirituality."
        
        return {
            'purpose': purpose,
            'talents': talents,
            'spiritual_path': spiritual_path
        }
    
    def _calculate_lifetime_scores(self, chart: Dict, planets: Dict) -> Dict:
        """Calculate overall life area scores"""
        
        scores = {
            'career': 6,
            'finance': 6,
            'relationship': 6,
            'health': 6
        }
        
        # Boost scores based on yogas
        if 'Raj Yoga' in chart['yogas']:
            scores['career'] += 2
        if 'Dhana Yoga' in chart['yogas']:
            scores['finance'] += 2
        
        # Reduce for doshas
        if 'Mangal Dosha' in chart['doshas']:
            scores['relationship'] -= 1
        
        # Overall average
        scores['overall'] = round(sum(scores.values()) / 4)
        
        # Ensure 1-10 range
        for key in scores:
            scores[key] = max(1, min(10, scores[key]))
        
        return scores
    
    def _generate_lifetime_summary(self, chart: Dict, dasha: Dict) -> str:
        """Generate overall lifetime summary"""
        summary = f"Life journey is guided by {chart['strengths'][0] if chart['strengths'] else 'balanced planetary influences'}. "
        summary += f"Current major period is {dasha['current']['lord']} Dasha focusing on {dasha['current']['theme']}. "
        
        if chart['yogas']:
            summary += f"Birth chart contains {chart['yogas'][0]}, indicating potential for significant achievements. "
        
        summary += "Overall life path shows steady progress with opportunities for growth in all major areas."
        
        return summary
    
    def _generate_detailed_lifetime(self, career, finance, relationship, health) -> str:
        """Generate detailed lifetime prediction"""
        detailed = f"CAREER: {career['prediction']}\n\n"
        detailed += f"FINANCE: {finance['prediction']}\n\n"
        detailed += f"RELATIONSHIPS: {relationship['prediction']}\n\n"
        detailed += f"HEALTH: {health['prediction']}"
        
        return detailed


# Example usage
if __name__ == "__main__":
    generator = LifetimeAnalysisGenerator()
    
    result = generator.generate_lifetime_analysis(
        birth_date="1990-05-15",
        birth_time="14:30:00",
        birth_location="Mumbai, India"
    )
    
    print("Lifetime Analysis Generated!")
    print(f"Title: {result['title']}")
    print(f"Life Purpose: {result['life_purpose']}")
    print(f"Career Fields: {', '.join(result['career_best_fields'][:3])}")
    print(f"Current Dasha: {result['current_dasha']['lord']} ({result['current_dasha']['theme']})")