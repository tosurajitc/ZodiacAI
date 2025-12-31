# astrology-engine/calculations/remedies/gemstone_suggestions.py
# Gemstone Recommendations based on planetary positions

from typing import Dict, List, Optional
from datetime import datetime
import sys
sys.path.append('..')
from calculations.base_calculator import BaseCalculator

class GemstoneSuggestions(BaseCalculator):
    """
    Generate personalized gemstone recommendations based on:
    1. Weak planets in birth chart
    2. Current dasha period
    3. Malefic positions requiring strengthening
    """
    
    # Complete gemstone data for each planet
    GEMSTONE_DATA = {
        'Sun': {
            'primary': 'Ruby',
            'substitute': ['Red Garnet', 'Red Spinel'],
            'weight': '3-6 carats',
            'metal': 'Gold or Copper',
            'finger': 'Ring finger (right hand)',
            'day': 'Sunday',
            'time': 'Within 1 hour after sunrise',
            'benefits': ['Leadership', 'Confidence', 'Authority', 'Health', 'Father relationship'],
            'mantra': 'Om Suryaya Namaha',
            'deity': 'Surya (Sun God)',
            'price_range': '₹5,000 - ₹50,000+ per carat'
        },
        'Moon': {
            'primary': 'Pearl',
            'substitute': ['Moonstone'],
            'weight': '4-7 carats',
            'metal': 'Silver',
            'finger': 'Little finger (right hand)',
            'day': 'Monday',
            'time': 'Evening during waxing moon',
            'benefits': ['Emotional balance', 'Mental peace', 'Intuition', 'Mother relationship', 'Memory'],
            'mantra': 'Om Chandraya Namaha',
            'deity': 'Chandra (Moon God)',
            'price_range': '₹2,000 - ₹20,000 per pearl'
        },
        'Mars': {
            'primary': 'Red Coral',
            'substitute': ['Carnelian', 'Red Agate'],
            'weight': '5-8 carats',
            'metal': 'Gold, Copper, or Silver',
            'finger': 'Ring finger (right hand)',
            'day': 'Tuesday',
            'time': 'Morning within 1 hour after sunrise',
            'benefits': ['Courage', 'Energy', 'Property', 'Sibling harmony', 'Sports performance'],
            'mantra': 'Om Mangalaya Namaha',
            'deity': 'Mangal (Mars God)',
            'price_range': '₹1,000 - ₹10,000 per carat'
        },
        'Mercury': {
            'primary': 'Emerald',
            'substitute': ['Green Tourmaline', 'Peridot', 'Green Jade'],
            'weight': '3-6 carats',
            'metal': 'Gold or Silver',
            'finger': 'Little finger (right hand)',
            'day': 'Wednesday',
            'time': 'Morning within 1 hour after sunrise',
            'benefits': ['Communication', 'Business', 'Intelligence', 'Nervous system', 'Education'],
            'mantra': 'Om Budhaya Namaha',
            'deity': 'Budha (Mercury God)',
            'price_range': '₹10,000 - ₹100,000+ per carat'
        },
        'Jupiter': {
            'primary': 'Yellow Sapphire',
            'substitute': ['Yellow Topaz', 'Citrine', 'Yellow Tourmaline'],
            'weight': '3-6 carats',
            'metal': 'Gold',
            'finger': 'Index finger (right hand)',
            'day': 'Thursday',
            'time': 'Morning within 1 hour after sunrise',
            'benefits': ['Wisdom', 'Wealth', 'Children', 'Marriage', 'Spiritual growth', 'Fortune'],
            'mantra': 'Om Gurave Namaha',
            'deity': 'Guru/Brihaspati (Jupiter God)',
            'price_range': '₹5,000 - ₹50,000+ per carat'
        },
        'Venus': {
            'primary': 'Diamond',
            'substitute': ['White Sapphire', 'White Zircon', 'White Topaz'],
            'weight': '1-2 carats',
            'metal': 'Silver, Platinum, or White Gold',
            'finger': 'Middle finger or Ring finger (right hand)',
            'day': 'Friday',
            'time': 'Morning within 1 hour after sunrise',
            'benefits': ['Love', 'Marriage', 'Luxury', 'Art', 'Beauty', 'Material comforts'],
            'mantra': 'Om Shukraya Namaha',
            'deity': 'Shukra (Venus God)',
            'price_range': '₹50,000 - ₹5,00,000+ per carat'
        },
        'Saturn': {
            'primary': 'Blue Sapphire',
            'substitute': ['Amethyst', 'Blue Topaz', 'Lapis Lazuli'],
            'weight': '4-7 carats',
            'metal': 'Silver, Iron, or Panchdhatu',
            'finger': 'Middle finger (right hand)',
            'day': 'Saturday',
            'time': 'Evening after sunset',
            'benefits': ['Discipline', 'Patience', 'Longevity', 'Karmic relief', 'Career stability'],
            'mantra': 'Om Shanaye Namaha',
            'deity': 'Shani (Saturn God)',
            'price_range': '₹10,000 - ₹1,00,000+ per carat',
            'warning': 'MUST trial for 3 days before permanent wearing'
        },
        'Rahu': {
            'primary': 'Hessonite (Gomed)',
            'substitute': ['Garnet', 'Spessartite'],
            'weight': '5-8 carats',
            'metal': 'Silver or Panchdhatu',
            'finger': 'Middle finger (right hand)',
            'day': 'Saturday',
            'time': 'Evening after sunset',
            'benefits': ['Mental clarity', 'Foreign opportunities', 'Material success', 'Innovation'],
            'mantra': 'Om Rahave Namaha',
            'deity': 'Rahu (North Node)',
            'price_range': '₹1,500 - ₹15,000 per carat'
        },
        'Ketu': {
            'primary': "Cat's Eye (Lehsunia)",
            'substitute': ['Turquoise', 'Tiger Eye'],
            'weight': '5-8 carats',
            'metal': 'Silver or Panchdhatu',
            'finger': 'Middle finger (right hand)',
            'day': 'Wednesday or Thursday',
            'time': 'Evening after sunset',
            'benefits': ['Spirituality', 'Intuition', 'Moksha', 'Hidden knowledge', 'Detachment'],
            'mantra': 'Om Ketave Namaha',
            'deity': 'Ketu (South Node)',
            'price_range': '₹2,000 - ₹20,000 per carat'
        }
    }
    
    def __init__(self):
        """Initialize gemstone suggestions"""
        super().__init__()
    
    def suggest_gemstones(
        self,
        birth_date: str,
        birth_time: str,
        birth_location: str = None,
        latitude: float = None,
        longitude: float = None,
        timezone: str = None,
        current_issues: List[str] = None
    ) -> Dict:
        """
        Generate gemstone recommendations
        
        Args:
            birth_date: 'YYYY-MM-DD'
            birth_time: 'HH:MM:SS'
            birth_location: Location name
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Timezone
            current_issues: List of current issues/concerns
        
        Returns:
            Dict with gemstone recommendations
        """
        
        # Handle geocoding
        geo_data = self.handle_geocoding(birth_location, latitude, longitude, timezone)
        
        # Parse birth datetime
        birth_datetime = self.parse_birth_datetime(birth_date, birth_time)
        
        # Calculate natal chart
        birth_jd = self.calculate_julian_day(birth_datetime)
        natal_ascendant = self.calculate_ascendant(birth_jd, geo_data['latitude'], geo_data['longitude'])
        natal_planets = self.get_all_planets(birth_jd)
        
        # Identify weak planets
        weak_planets = self._identify_weak_planets(natal_planets, natal_ascendant)
        
        # Calculate current dasha
        current_dasha = self._get_current_dasha_lord(natal_planets['Moon']['longitude'], birth_datetime)
        
        # Generate recommendations
        recommendations = []
        
        # Primary recommendation (weakest planet or dasha lord)
        if weak_planets:
            primary_planet = weak_planets[0]['planet']
            recommendations.append({
                'priority': 1,
                'planet': primary_planet,
                'reason': f"Strengthening {primary_planet} - {weak_planets[0]['reason']}",
                **self.GEMSTONE_DATA[primary_planet],
                'type': 'primary'
            })
        
        # Dasha lord gemstone
        if current_dasha and current_dasha not in [r['planet'] for r in recommendations]:
            recommendations.append({
                'priority': 2,
                'planet': current_dasha,
                'reason': f"Currently in {current_dasha} Dasha period",
                **self.GEMSTONE_DATA[current_dasha],
                'type': 'dasha'
            })
        
        # Additional recommendations based on issues
        if current_issues:
            issue_based = self._get_issue_based_recommendations(current_issues, recommendations)
            recommendations.extend(issue_based)
        
        # General guidelines
        guidelines = self._get_wearing_guidelines()
        
        # Precautions
        precautions = self._get_precautions()
        
        return {
            'recommendations': recommendations[:3],  # Top 3 recommendations
            'total_suggestions': len(recommendations),
            'wearing_guidelines': guidelines,
            'precautions': precautions,
            'consultation_note': 'Always consult a qualified astrologer before wearing gemstones, especially Blue Sapphire and Cat\'s Eye',
            'generated_at': datetime.now().isoformat()
        }
    
    def _identify_weak_planets(self, planets: Dict, ascendant: Dict) -> List[Dict]:
        """Identify weak planets that need strengthening"""
        weak_planets = []
        
        for planet, data in planets.items():
            if planet in ['Rahu', 'Ketu']:
                continue
            
            strength = self.calculate_planet_strength_simple(data)
            
            # Weak if strength < 40
            if strength['strength'] < 40:
                weak_planets.append({
                    'planet': planet,
                    'strength': strength['strength'],
                    'reason': f"{planet} is {strength['status']} and needs strengthening"
                })
            
            # Debilitated planet
            if strength['status'] == 'debilitated':
                weak_planets.append({
                    'planet': planet,
                    'strength': strength['strength'],
                    'reason': f"{planet} is debilitated in {data['sign']}"
                })
        
        # Sort by strength (weakest first)
        weak_planets.sort(key=lambda x: x['strength'])
        
        return weak_planets
    
    def _get_current_dasha_lord(self, moon_lon: float, birth_date: datetime) -> str:
        """Get current Mahadasha lord"""
        NAKSHATRA_LORDS = [
            'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
        ] * 3
        
        nakshatra_span = 360 / 27
        nakshatra_num = int(moon_lon / nakshatra_span)
        
        return NAKSHATRA_LORDS[nakshatra_num]
    
    def _get_issue_based_recommendations(self, issues: List[str], existing: List[Dict]) -> List[Dict]:
        """Get gemstone recommendations based on current issues"""
        
        issue_planet_map = {
            'career': ['Sun', 'Saturn', 'Jupiter'],
            'finance': ['Jupiter', 'Venus', 'Mercury'],
            'health': ['Sun', 'Mars', 'Moon'],
            'relationship': ['Venus', 'Moon', 'Mars'],
            'education': ['Mercury', 'Jupiter'],
            'confidence': ['Sun', 'Mars'],
            'peace': ['Moon', 'Jupiter'],
            'business': ['Mercury', 'Jupiter']
        }
        
        recommendations = []
        existing_planets = [r['planet'] for r in existing]
        
        for issue in issues:
            issue_lower = issue.lower()
            for key, planets in issue_planet_map.items():
                if key in issue_lower:
                    for planet in planets:
                        if planet not in existing_planets:
                            recommendations.append({
                                'priority': 3,
                                'planet': planet,
                                'reason': f"Recommended for {issue}",
                                **self.GEMSTONE_DATA[planet],
                                'type': 'issue-based'
                            })
                            existing_planets.append(planet)
                            break
                    break
        
        return recommendations
    
    def _get_wearing_guidelines(self) -> List[str]:
        """Get general wearing guidelines"""
        return [
            "Get gemstone energized/activated by a priest before wearing",
            "Wear on the specified day and time for best results",
            "Natural, untreated gemstones are most effective",
            "Clean gemstone regularly with water and mild soap",
            "Remove gemstone during sleep if feeling uncomfortable",
            "Wear continuously for at least 40 days to see effects",
            "If using substitute stones, increase the weight by 20-30%",
            "Blue Sapphire and Cat's Eye should be tried for 3 days first",
            "Consult an astrologer before wearing multiple gemstones together",
            "Buy from certified gem dealers only"
        ]
    
    def _get_precautions(self) -> List[str]:
        """Get precautions for wearing gemstones"""
        return [
            "Never wear cracked or damaged gemstones",
            "Blue Sapphire can give adverse effects if not suitable - trial mandatory",
            "Do not wear gemstones of enemy planets together",
            "Ruby (Sun) and Blue Sapphire (Saturn) should not be worn together",
            "Pearl (Moon) and Cat's Eye (Ketu) should not be worn together",
            "Pregnant women should consult before wearing new gemstones",
            "Remove gemstone during X-rays, surgery, or MRI scans",
            "If experiencing negative effects, remove immediately and consult astrologer",
            "Store gemstone jewelry in clean, separate boxes",
            "Re-energize gemstones every 6-12 months"
        ]
    
    def get_gemstone_info(self, planet: str) -> Dict:
        """Get detailed information about a specific planet's gemstone"""
        if planet not in self.GEMSTONE_DATA:
            raise ValueError(f"Invalid planet: {planet}")
        
        return self.GEMSTONE_DATA[planet]
    
    def get_all_gemstones(self) -> Dict:
        """Get information about all gemstones"""
        return self.GEMSTONE_DATA


# Example usage
if __name__ == "__main__":
    suggester = GemstoneSuggestions()
    
    result = suggester.suggest_gemstones(
        birth_date="1990-05-15",
        birth_time="14:30:00",
        birth_location="Mumbai, India",
        current_issues=["career", "confidence"]
    )
    
    print("Gemstone Recommendations:")
    for rec in result['recommendations']:
        print(f"\n{rec['priority']}. {rec['planet']} - {rec['primary']}")
        print(f"   Reason: {rec['reason']}")
        print(f"   Wear on: {rec['finger']}, {rec['day']} {rec['time']}")
        print(f"   Benefits: {', '.join(rec['benefits'][:3])}")