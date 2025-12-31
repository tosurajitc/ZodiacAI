# astrology-engine/calculations/remedies/remedy_engine.py
# Main Remedy Engine - Orchestrates all remedy types

from typing import Dict, List, Optional
from datetime import datetime
import sys
sys.path.append('..')
from base_calculator import BaseCalculator
from gemstone_suggestions import GemstoneSuggestions
from mantra_suggestions import MantraSuggestions

class RemedyEngine(BaseCalculator):
    """
    Main remedy engine that provides comprehensive remedial solutions:
    1. Gemstone recommendations
    2. Mantra suggestions
    3. Donation/charity remedies
    4. Fasting guidelines
    5. Lifestyle recommendations
    6. Color therapy
    7. Rudraksha suggestions
    """
    
    def __init__(self):
        """Initialize remedy engine with all remedy modules"""
        super().__init__()
        self.gemstone_engine = GemstoneSuggestions()
        self.mantra_engine = MantraSuggestions()
    
    def generate_complete_remedies(
        self,
        birth_date: str,
        birth_time: str,
        birth_location: str = None,
        latitude: float = None,
        longitude: float = None,
        timezone: str = None,
        current_issues: List[str] = None,
        budget: str = 'medium'  # low, medium, high
    ) -> Dict:
        """
        Generate comprehensive remedy package
        
        Args:
            birth_date: 'YYYY-MM-DD'
            birth_time: 'HH:MM:SS'
            birth_location: Location name
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Timezone
            current_issues: List of current life issues
            budget: Budget level for gemstone recommendations
        
        Returns:
            Complete remedy package
        """
        
        # Handle geocoding
        geo_data = self.handle_geocoding(birth_location, latitude, longitude, timezone)
        
        # Parse birth datetime
        birth_datetime = self.parse_birth_datetime(birth_date, birth_time)
        
        # Calculate natal chart
        birth_jd = self.calculate_julian_day(birth_datetime)
        natal_ascendant = self.calculate_ascendant(birth_jd, geo_data['latitude'], geo_data['longitude'])
        natal_planets = self.get_all_planets(birth_jd)
        
        # Get gemstone recommendations
        gemstone_remedies = self.gemstone_engine.suggest_gemstones(
            birth_date, birth_time,
            geo_data['location'], geo_data['latitude'], geo_data['longitude'], geo_data['timezone'],
            current_issues
        )
        
        # Get mantra recommendations
        mantra_remedies = self.mantra_engine.suggest_mantras(
            birth_date, birth_time,
            geo_data['location'], geo_data['latitude'], geo_data['longitude'], geo_data['timezone'],
            current_issues
        )
        
        # Generate additional remedies
        donation_remedies = self._generate_donation_remedies(natal_planets, natal_ascendant)
        fasting_remedies = self._generate_fasting_remedies(natal_planets)
        lifestyle_remedies = self._generate_lifestyle_remedies(natal_planets, current_issues)
        color_therapy = self._generate_color_therapy(natal_planets)
        rudraksha_remedies = self._generate_rudraksha_remedies(natal_planets)
        
        # Puja/ritual recommendations
        puja_remedies = self._generate_puja_remedies(natal_planets, current_issues)
        
        # Generate priority action plan
        action_plan = self._create_action_plan(
            gemstone_remedies,
            mantra_remedies,
            donation_remedies,
            budget
        )
        
        return {
            'summary': self._generate_remedy_summary(natal_planets, current_issues),
            
            # Main remedy categories
            'gemstone_remedies': gemstone_remedies,
            'mantra_remedies': mantra_remedies,
            'donation_remedies': donation_remedies,
            'fasting_remedies': fasting_remedies,
            'lifestyle_remedies': lifestyle_remedies,
            'color_therapy': color_therapy,
            'rudraksha_remedies': rudraksha_remedies,
            'puja_remedies': puja_remedies,
            
            # Action plan
            'action_plan': action_plan,
            
            # General guidelines
            'important_notes': [
                "Remedies work gradually - patience is required",
                "Combine multiple remedies for best results",
                "Faith and consistency are more important than perfection",
                "Consult qualified astrologer for personalized guidance",
                "Never wear gemstones without proper consultation",
                "Remedies complement, not replace, practical efforts",
                "Maintain positive attitude and ethical conduct"
            ],
            
            # Consultation advice
            'when_to_consult': [
                "Before wearing Blue Sapphire or Cat's Eye",
                "If experiencing severe Dasha period effects",
                "For Sade Sati remedies",
                "Before major life decisions",
                "If multiple doshas are present"
            ],
            
            'generated_at': datetime.now().isoformat(),
            'birth_location': geo_data['location']
        }
    
    def _generate_donation_remedies(self, planets: Dict, ascendant: Dict) -> Dict:
        """Generate donation/charity recommendations"""
        
        donation_items = {
            'Sun': {
                'items': ['Wheat', 'Jaggery', 'Red cloth', 'Copper items', 'Ruby (if possible)'],
                'beneficiary': 'Father figure, temples, government hospitals',
                'day': 'Sunday',
                'time': 'Morning'
            },
            'Moon': {
                'items': ['Rice', 'Milk', 'White cloth', 'Silver items', 'Pearl (if possible)'],
                'beneficiary': 'Mother figure, elderly women, orphanages',
                'day': 'Monday',
                'time': 'Evening'
            },
            'Mars': {
                'items': ['Red lentils', 'Jaggery', 'Red cloth', 'Copper items', 'Coral (if possible)'],
                'beneficiary': 'Soldiers, athletes, temples',
                'day': 'Tuesday',
                'time': 'Morning'
            },
            'Mercury': {
                'items': ['Green vegetables', 'Books', 'Green cloth', 'Brass items'],
                'beneficiary': 'Students, libraries, educational institutions',
                'day': 'Wednesday',
                'time': 'Morning'
            },
            'Jupiter': {
                'items': ['Yellow dal', 'Turmeric', 'Yellow cloth', 'Gold items', 'Books'],
                'beneficiary': 'Priests, teachers, temples, schools',
                'day': 'Thursday',
                'time': 'Morning'
            },
            'Venus': {
                'items': ['Rice', 'Sugar', 'White cloth', 'Cow', 'Diamond (if possible)'],
                'beneficiary': 'Young women, artists, cow shelters',
                'day': 'Friday',
                'time': 'Morning'
            },
            'Saturn': {
                'items': ['Black sesame', 'Mustard oil', 'Black cloth', 'Iron items', 'Shoes'],
                'beneficiary': 'Poor people, disabled persons, elderly',
                'day': 'Saturday',
                'time': 'Evening'
            },
            'Rahu': {
                'items': ['Coconut', 'Blanket', 'Blue/black cloth', 'Sesame'],
                'beneficiary': 'Outcasts, foreigners, orphanages',
                'day': 'Saturday',
                'time': 'Evening'
            },
            'Ketu': {
                'items': ['Sesame', 'Flag/banner', 'Multicolor cloth', 'Blanket'],
                'beneficiary': 'Spiritual seekers, temples, dogs',
                'day': 'Thursday',
                'time': 'Morning'
            }
        }
        
        # Identify planets needing remedies
        weak_planets = []
        for planet, data in planets.items():
            if planet in ['Rahu', 'Ketu']:
                continue
            strength = self.calculate_planet_strength_simple(data)
            if strength['strength'] < 50:
                weak_planets.append(planet)
        
        recommendations = []
        for planet in weak_planets[:3]:  # Top 3
            if planet in donation_items:
                recommendations.append({
                    'planet': planet,
                    **donation_items[planet]
                })
        
        return {
            'recommendations': recommendations,
            'general_advice': [
                "Donate with pure intention, not for show",
                "Give to those who genuinely need",
                "Donate on the planet's day for maximum benefit",
                "Regular small donations better than one-time large donation"
            ]
        }
    
    def _generate_fasting_remedies(self, planets: Dict) -> Dict:
        """Generate fasting recommendations"""
        
        fasting_guidelines = {
            'Sunday': {
                'planet': 'Sun',
                'type': 'Sunrise to sunset',
                'food_allowed': 'Fruits, milk (after sunset)',
                'water': 'Allowed',
                'benefits': 'Health, confidence, father relationship'
            },
            'Monday': {
                'planet': 'Moon',
                'type': 'Sunrise to sunset',
                'food_allowed': 'Fruits, milk, once (after sunset)',
                'water': 'Allowed',
                'benefits': 'Mental peace, emotional balance'
            },
            'Tuesday': {
                'planet': 'Mars',
                'type': 'Sunrise to sunset',
                'food_allowed': 'Once at night (sweet items)',
                'water': 'Allowed',
                'benefits': 'Courage, property matters, Mangal Dosha'
            },
            'Wednesday': {
                'planet': 'Mercury',
                'type': 'Sunrise to sunset',
                'food_allowed': 'Fruits, green vegetables',
                'water': 'Allowed',
                'benefits': 'Intelligence, business success'
            },
            'Thursday': {
                'planet': 'Jupiter',
                'type': 'Sunrise to sunset',
                'food_allowed': 'Yellow foods, gram (after sunset)',
                'water': 'Allowed',
                'benefits': 'Wealth, marriage, children'
            },
            'Friday': {
                'planet': 'Venus',
                'type': 'Sunrise to sunset',
                'food_allowed': 'White foods (after sunset)',
                'water': 'Allowed',
                'benefits': 'Love, marriage, luxury'
            },
            'Saturday': {
                'planet': 'Saturn',
                'type': 'Sunrise to sunset',
                'food_allowed': 'Once at night (no salt)',
                'water': 'Allowed',
                'benefits': 'Sade Sati relief, karmic issues'
            }
        }
        
        return {
            'fasting_by_day': fasting_guidelines,
            'important_notes': [
                "Fast only if physically capable",
                "Pregnant women and sick people should not fast",
                "Water is generally allowed during fasts",
                "Break fast after sunset prayers",
                "Maintain purity of thought while fasting",
                "Fast regularly on one day per week for 40 weeks"
            ]
        }
    
    def _generate_lifestyle_remedies(self, planets: Dict, issues: List[str]) -> List[str]:
        """Generate lifestyle recommendations"""
        
        recommendations = []
        
        # General recommendations
        recommendations.extend([
            "Wake up early (before sunrise) for spiritual practices",
            "Practice daily meditation for 15-20 minutes",
            "Maintain cleanliness and hygiene",
            "Avoid alcohol, non-vegetarian food (especially on fasting days)",
            "Be honest and ethical in all dealings",
            "Respect elders and teachers",
            "Help those in need without expectation"
        ])
        
        # Issue-specific
        if issues:
            for issue in issues:
                if 'health' in issue.lower():
                    recommendations.append("Practice yoga and pranayama daily")
                if 'career' in issue.lower():
                    recommendations.append("Face East while working for Sun's blessings")
                if 'peace' in issue.lower():
                    recommendations.append("Avoid conflicts, practice forgiveness")
                if 'wealth' in issue.lower():
                    recommendations.append("Donate 2-5% of income regularly")
        
        return list(set(recommendations))  # Remove duplicates
    
    def _generate_color_therapy(self, planets: Dict) -> Dict:
        """Generate color recommendations"""
        
        planet_colors = {
            'Sun': ['Red', 'Orange', 'Gold'],
            'Moon': ['White', 'Silver', 'Pearl'],
            'Mars': ['Red', 'Maroon', 'Scarlet'],
            'Mercury': ['Green', 'Emerald Green'],
            'Jupiter': ['Yellow', 'Gold', 'Saffron'],
            'Venus': ['White', 'Pink', 'Cream'],
            'Saturn': ['Black', 'Dark Blue', 'Navy'],
            'Rahu': ['Smoky', 'Dark Grey'],
            'Ketu': ['Brown', 'Grey', 'Maroon']
        }
        
        # Find weakest planet
        weak_planet = None
        min_strength = 100
        for planet, data in planets.items():
            if planet in ['Rahu', 'Ketu']:
                continue
            strength = self.calculate_planet_strength_simple(data)
            if strength['strength'] < min_strength:
                min_strength = strength['strength']
                weak_planet = planet
        
        recommendations = {
            'primary_colors': planet_colors.get(weak_planet, ['Yellow', 'White']),
            'usage': [
                "Wear these colors on the planet's day",
                "Use in home décor (curtains, cushions)",
                "Carry handkerchief/cloth of this color",
                "Use in office/workspace if possible"
            ]
        }
        
        return recommendations
    
    def _generate_rudraksha_remedies(self, planets: Dict) -> Dict:
        """Generate Rudraksha recommendations"""
        
        rudraksha_map = {
            'Sun': {'mukhi': '1 or 12 Mukhi', 'benefits': 'Confidence, health, leadership'},
            'Moon': {'mukhi': '2 Mukhi', 'benefits': 'Emotional balance, relationships'},
            'Mars': {'mukhi': '3 Mukhi', 'benefits': 'Courage, energy, Mangal Dosha'},
            'Mercury': {'mukhi': '4 Mukhi', 'benefits': 'Intelligence, communication'},
            'Jupiter': {'mukhi': '5 Mukhi', 'benefits': 'Wisdom, wealth, health'},
            'Venus': {'mukhi': '6 Mukhi', 'benefits': 'Love, luxury, creativity'},
            'Saturn': {'mukhi': '7 or 14 Mukhi', 'benefits': 'Sade Sati, discipline'},
            'Rahu': {'mukhi': '8 Mukhi', 'benefits': 'Obstacles removal'},
            'Ketu': {'mukhi': '9 Mukhi', 'benefits': 'Spirituality, Moksha'}
        }
        
        # Find weak planets
        recommendations = []
        for planet, data in planets.items():
            if planet in ['Rahu', 'Ketu']:
                continue
            strength = self.calculate_planet_strength_simple(data)
            if strength['strength'] < 50 and planet in rudraksha_map:
                recommendations.append({
                    'planet': planet,
                    **rudraksha_map[planet]
                })
        
        return {
            'recommendations': recommendations[:2],  # Top 2
            'wearing_instructions': [
                "Wear on Monday after proper energization",
                "Wear on red or black thread",
                "Chant 'Om Namah Shivaya' while wearing",
                "Clean with water regularly",
                "Can wear multiple Rudraksha together"
            ]
        }
    
    def _generate_puja_remedies(self, planets: Dict, issues: List[str]) -> Dict:
        """Generate puja/ritual recommendations"""
        
        pujas = {
            'general': [
                "Surya Namaskar daily (for Sun)",
                "Chandra Namaskar (for Moon)",
                "Hanuman Chalisa (for Mars/Saturn)",
                "Vishnu Sahasranama (for Mercury/Jupiter)",
                "Lakshmi puja on Friday (for Venus)"
            ],
            'special': []
        }
        
        # Issue-based special pujas
        if issues:
            for issue in issues:
                if 'marriage' in issue.lower():
                    pujas['special'].append("Gauri-Shankar puja for marriage")
                if 'career' in issue.lower():
                    pujas['special'].append("Ganesh puja for obstacle removal")
                if 'wealth' in issue.lower():
                    pujas['special'].append("Lakshmi puja on Fridays")
                if 'health' in issue.lower():
                    pujas['special'].append("Mahamrityunjaya mantra daily")
        
        return pujas
    
    def _create_action_plan(
        self,
        gemstone_remedies: Dict,
        mantra_remedies: Dict,
        donation_remedies: Dict,
        budget: str
    ) -> Dict:
        """Create prioritized action plan"""
        
        immediate_actions = [
            "Start daily mantra practice (no cost)",
            "Begin fasting on recommended days",
            "Practice daily meditation/prayer"
        ]
        
        short_term = [
            "Donate recommended items on specified days",
            "Adopt color therapy in daily wear",
            "Start Rudraksha wearing (low cost)"
        ]
        
        long_term = []
        if budget in ['medium', 'high']:
            long_term.append("Consider gemstone after 3 months of other remedies")
        
        long_term.extend([
            "Maintain consistency in all practices",
            "Review progress every 3 months",
            "Consult astrologer for major decisions"
        ])
        
        return {
            'immediate': immediate_actions,
            'short_term_1_3_months': short_term,
            'long_term_3_plus_months': long_term,
            'priority_order': [
                "1. Mantra chanting (most important, zero cost)",
                "2. Fasting and donation",
                "3. Lifestyle changes",
                "4. Rudraksha",
                "5. Gemstones (after consultation)"
            ]
        }
    
    def _generate_remedy_summary(self, planets: Dict, issues: List[str]) -> str:
        """Generate overall remedy summary"""
        
        summary = "Based on your birth chart analysis, a comprehensive remedy package has been prepared. "
        
        # Count weak planets
        weak_count = sum(1 for p, d in planets.items() 
                        if p not in ['Rahu', 'Ketu'] and 
                        self.calculate_planet_strength_simple(d)['strength'] < 50)
        
        if weak_count > 3:
            summary += "Multiple planets need strengthening, so combination of remedies is recommended. "
        else:
            summary += "Focus on the primary recommendations for best results. "
        
        summary += "Start with no-cost remedies (mantras, fasting) before investing in gemstones. "
        summary += "Consistency and faith are key to remedy effectiveness."
        
        return summary


# Example usage
if __name__ == "__main__":
    engine = RemedyEngine()
    
    result = engine.generate_complete_remedies(
        birth_date="1990-05-15",
        birth_time="14:30:00",
        birth_location="Mumbai, India",
        current_issues=["career", "health"],
        budget="medium"
    )
    
    print("Complete Remedy Package Generated!")
    print(f"\nSummary: {result['summary']}")
    print(f"\nImmediate Actions: {len(result['action_plan']['immediate'])}")
    print(f"Gemstone Recommendations: {len(result['gemstone_remedies']['recommendations'])}")
    print(f"Mantra Recommendations: {len(result['mantra_remedies']['recommendations'])}")