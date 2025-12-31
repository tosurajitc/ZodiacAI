# astrology-engine/calculations/remedies/mantra_suggestions.py
# Mantra Recommendations based on planetary positions

from typing import Dict, List, Optional
from datetime import datetime
import sys
sys.path.append('..')
from calculations.base_calculator import BaseCalculator

class MantraSuggestions(BaseCalculator):
    """
    Generate personalized mantra recommendations for planetary remedies.
    Mantras are powerful sound vibrations that align with planetary energies.
    """
    
    # Complete mantra data for each planet
    MANTRA_DATA = {
        'Sun': {
            'beej_mantra': 'Om Hraam Hreem Hraum Sah Suryaya Namaha',
            'vedic_mantra': 'Om Ghrani Suryaya Aditya Om',
            'simple_mantra': 'Om Suryaya Namaha',
            'gayatri_mantra': 'Om Bhaskaraya Vidmahe Divakaraya Dhimahi Tanno Surya Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 7000,
                'total_for_siddhi': 100000
            },
            'best_time': 'Sunrise or early morning',
            'best_day': 'Sunday',
            'direction': 'East',
            'benefits': ['Leadership', 'Health', 'Confidence', 'Authority', 'Father relationship'],
            'offering': 'Red flowers, wheat, jaggery',
            'fasting_day': 'Sunday (sunrise to sunset)',
            'deity': 'Surya Dev',
            'color_to_wear': 'Red, Orange'
        },
        'Moon': {
            'beej_mantra': 'Om Shraam Shreem Shraum Sah Chandraya Namaha',
            'vedic_mantra': 'Om Som Somaya Namah',
            'simple_mantra': 'Om Chandraya Namaha',
            'gayatri_mantra': 'Om Padmadhwajaya Vidmahe Hema Roopaya Dhimahi Tanno Chandra Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 11000,
                'total_for_siddhi': 110000
            },
            'best_time': 'Evening, especially during waxing moon',
            'best_day': 'Monday',
            'direction': 'Northwest',
            'benefits': ['Mental peace', 'Emotional balance', 'Mother relationship', 'Intuition'],
            'offering': 'White flowers, rice, milk',
            'fasting_day': 'Monday (sunrise to sunset)',
            'deity': 'Chandra Dev',
            'color_to_wear': 'White, Silver'
        },
        'Mars': {
            'beej_mantra': 'Om Kraam Kreem Kraum Sah Bhaumaya Namaha',
            'vedic_mantra': 'Om Angarakaya Namaha',
            'simple_mantra': 'Om Mangalaya Namaha',
            'gayatri_mantra': 'Om Angarakaya Vidmahe Shakti Hasthaya Dhimahi Tanno Bhauma Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 10000,
                'total_for_siddhi': 100000
            },
            'best_time': 'Morning, especially Tuesday',
            'best_day': 'Tuesday',
            'direction': 'South',
            'benefits': ['Courage', 'Energy', 'Property', 'Siblings harmony', 'Mangal Dosha remedy'],
            'offering': 'Red flowers, red lentils, jaggery',
            'fasting_day': 'Tuesday (sunrise to sunset)',
            'deity': 'Mangal Dev (Hanuman)',
            'color_to_wear': 'Red, Maroon'
        },
        'Mercury': {
            'beej_mantra': 'Om Braam Breem Braum Sah Budhaya Namaha',
            'vedic_mantra': 'Om Bum Budhaya Namah',
            'simple_mantra': 'Om Budhaya Namaha',
            'gayatri_mantra': 'Om Gajadhwajaya Vidmahe Sukha Hasthaya Dhimahi Tanno Budha Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 9000,
                'total_for_siddhi': 90000
            },
            'best_time': 'Morning or evening',
            'best_day': 'Wednesday',
            'direction': 'North',
            'benefits': ['Intelligence', 'Communication', 'Business', 'Education', 'Nervous system'],
            'offering': 'Green flowers, green vegetables, moong dal',
            'fasting_day': 'Wednesday (sunrise to sunset)',
            'deity': 'Budh Dev (Lord Vishnu)',
            'color_to_wear': 'Green'
        },
        'Jupiter': {
            'beej_mantra': 'Om Graam Greem Graum Sah Gurave Namaha',
            'vedic_mantra': 'Om Brihaspataye Namah',
            'simple_mantra': 'Om Gurave Namaha',
            'gayatri_mantra': 'Om Vrishabadhwajaya Vidmahe Kruni Hasthaya Dhimahi Tanno Guru Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 19000,
                'total_for_siddhi': 190000
            },
            'best_time': 'Morning, especially Thursday',
            'best_day': 'Thursday',
            'direction': 'Northeast',
            'benefits': ['Wisdom', 'Wealth', 'Children', 'Marriage', 'Spiritual growth', 'Fortune'],
            'offering': 'Yellow flowers, chana dal, turmeric, banana',
            'fasting_day': 'Thursday (sunrise to sunset)',
            'deity': 'Guru/Brihaspati Dev',
            'color_to_wear': 'Yellow, Gold'
        },
        'Venus': {
            'beej_mantra': 'Om Draam Dreem Draum Sah Shukraya Namaha',
            'vedic_mantra': 'Om Shum Shukraya Namah',
            'simple_mantra': 'Om Shukraya Namaha',
            'gayatri_mantra': 'Om Ashwadhwajaya Vidmahe Dhanur Hasthaya Dhimahi Tanno Shukra Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 16000,
                'total_for_siddhi': 160000
            },
            'best_time': 'Morning, especially Friday',
            'best_day': 'Friday',
            'direction': 'Southeast',
            'benefits': ['Love', 'Marriage', 'Luxury', 'Art', 'Beauty', 'Material comforts', 'Creativity'],
            'offering': 'White flowers, rice, sugar, white sweets',
            'fasting_day': 'Friday (sunrise to sunset)',
            'deity': 'Shukra Dev (Goddess Lakshmi)',
            'color_to_wear': 'White, Pink'
        },
        'Saturn': {
            'beej_mantra': 'Om Praam Preem Praum Sah Shanaye Namaha',
            'vedic_mantra': 'Om Sham Shanicharaya Namah',
            'simple_mantra': 'Om Shanaye Namaha',
            'gayatri_mantra': 'Om Kakadhwajaya Vidmahe Khadga Hasthaya Dhimahi Tanno Mandah Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 23000,
                'total_for_siddhi': 230000
            },
            'best_time': 'Evening, especially Saturday',
            'best_day': 'Saturday',
            'direction': 'West',
            'benefits': ['Discipline', 'Patience', 'Longevity', 'Karmic relief', 'Sade Sati remedy'],
            'offering': 'Black sesame, mustard oil, black cloth, iron items',
            'fasting_day': 'Saturday (sunrise to sunset)',
            'deity': 'Shani Dev (Lord Hanuman)',
            'color_to_wear': 'Black, Dark Blue',
            'special_remedy': 'Feed crows on Saturday'
        },
        'Rahu': {
            'beej_mantra': 'Om Bhraam Bhreem Bhraum Sah Rahave Namaha',
            'vedic_mantra': 'Om Raam Rahave Namah',
            'simple_mantra': 'Om Rahave Namaha',
            'gayatri_mantra': 'Om Naakadhwajaya Vidmahe Padma Hasthaya Dhimahi Tanno Rahu Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 18000,
                'total_for_siddhi': 180000
            },
            'best_time': 'Evening or night',
            'best_day': 'Saturday',
            'direction': 'Southwest',
            'benefits': ['Mental clarity', 'Foreign opportunities', 'Material success', 'Innovation'],
            'offering': 'Blue flowers, coconut, sesame',
            'fasting_day': 'Saturday (optional)',
            'deity': 'Rahu (Goddess Durga)',
            'color_to_wear': 'Dark colors, Smoky'
        },
        'Ketu': {
            'beej_mantra': 'Om Sraam Sreem Sraum Sah Ketave Namaha',
            'vedic_mantra': 'Om Kem Ketave Namah',
            'simple_mantra': 'Om Ketave Namaha',
            'gayatri_mantra': 'Om Ashwadhwajaya Vidmahe Soola Hasthaya Dhimahi Tanno Ketu Prachodayat',
            'repetitions': {
                'daily': 108,
                'special': 17000,
                'total_for_siddhi': 170000
            },
            'best_time': 'Evening or night',
            'best_day': 'Thursday or Wednesday',
            'direction': 'Northeast',
            'benefits': ['Spirituality', 'Moksha', 'Intuition', 'Hidden knowledge', 'Detachment'],
            'offering': 'Sesame, flag/banner, multicolor cloth',
            'fasting_day': 'Thursday (optional)',
            'deity': 'Ketu (Lord Ganesha)',
            'color_to_wear': 'Brown, Grey'
        }
    }
    
    def __init__(self):
        """Initialize mantra suggestions"""
        super().__init__()
    
    def suggest_mantras(
        self,
        birth_date: str,
        birth_time: str,
        birth_location: str = None,
        latitude: float = None,
        longitude: float = None,
        timezone: str = None,
        specific_issues: List[str] = None
    ) -> Dict:
        """
        Generate mantra recommendations
        
        Args:
            birth_date: 'YYYY-MM-DD'
            birth_time: 'HH:MM:SS'
            birth_location: Location name
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Timezone
            specific_issues: List of specific issues to address
        
        Returns:
            Dict with mantra recommendations
        """
        
        # Handle geocoding
        geo_data = self.handle_geocoding(birth_location, latitude, longitude, timezone)
        
        # Parse birth datetime
        birth_datetime = self.parse_birth_datetime(birth_date, birth_time)
        
        # Calculate natal chart
        birth_jd = self.calculate_julian_day(birth_datetime)
        natal_ascendant = self.calculate_ascendant(birth_jd, geo_data['latitude'], geo_data['longitude'])
        natal_planets = self.get_all_planets(birth_jd)
        
        # Identify planets needing strengthening
        weak_planets = self._identify_weak_planets(natal_planets)
        
        # Get current dasha
        current_dasha = self._get_current_dasha_lord(natal_planets['Moon']['longitude'], birth_datetime)
        
        # Generate recommendations
        recommendations = []
        
        # Primary recommendation (weakest planet)
        if weak_planets:
            primary = weak_planets[0]
            recommendations.append({
                'priority': 1,
                'planet': primary['planet'],
                'reason': primary['reason'],
                'urgency': 'High',
                **self.MANTRA_DATA[primary['planet']]
            })
        
        # Dasha period mantra
        if current_dasha:
            recommendations.append({
                'priority': 2,
                'planet': current_dasha,
                'reason': f"Currently running {current_dasha} Mahadasha",
                'urgency': 'Medium',
                **self.MANTRA_DATA[current_dasha]
            })
        
        # Issue-based mantras
        if specific_issues:
            issue_mantras = self._get_issue_based_mantras(specific_issues, recommendations)
            recommendations.extend(issue_mantras)
        
        # General guidelines
        guidelines = self._get_chanting_guidelines()
        
        # Additional practices
        additional_practices = self._get_additional_practices()
        
        return {
            'recommendations': recommendations[:3],  # Top 3
            'chanting_guidelines': guidelines,
            'additional_practices': additional_practices,
            'important_notes': [
                "Chant with concentration and devotion",
                "Morning time (Brahma Muhurta: 4-6 AM) is most powerful",
                "Use a mala (prayer beads) for counting",
                "Sit facing the recommended direction",
                "Maintain purity - bath before chanting",
                "Regular practice is more important than number of repetitions"
            ],
            'generated_at': datetime.now().isoformat()
        }
    
    def _identify_weak_planets(self, planets: Dict) -> List[Dict]:
        """Identify planets needing mantra remedies"""
        weak = []
        
        for planet, data in planets.items():
            if planet in ['Rahu', 'Ketu']:
                continue
            
            strength = self.calculate_planet_strength_simple(data)
            
            if strength['strength'] < 40:
                weak.append({
                    'planet': planet,
                    'strength': strength['strength'],
                    'reason': f"{planet} needs strengthening ({strength['status']})"
                })
        
        weak.sort(key=lambda x: x['strength'])
        return weak
    
    def _get_current_dasha_lord(self, moon_lon: float, birth_date: datetime) -> str:
        """Get current Mahadasha lord"""
        NAKSHATRA_LORDS = [
            'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
        ] * 3
        
        nakshatra_span = 360 / 27
        nakshatra_num = int(moon_lon / nakshatra_span)
        
        return NAKSHATRA_LORDS[nakshatra_num]
    
    def _get_issue_based_mantras(self, issues: List[str], existing: List[Dict]) -> List[Dict]:
        """Get mantras based on specific issues"""
        issue_planet_map = {
            'career': 'Sun',
            'wealth': 'Jupiter',
            'health': 'Sun',
            'peace': 'Moon',
            'education': 'Mercury',
            'marriage': 'Venus',
            'property': 'Mars',
            'spiritual': 'Jupiter'
        }
        
        recommendations = []
        existing_planets = [r['planet'] for r in existing]
        
        for issue in issues:
            issue_lower = issue.lower()
            for key, planet in issue_planet_map.items():
                if key in issue_lower and planet not in existing_planets:
                    recommendations.append({
                        'priority': 3,
                        'planet': planet,
                        'reason': f"Recommended for {issue}",
                        'urgency': 'Medium',
                        **self.MANTRA_DATA[planet]
                    })
                    existing_planets.append(planet)
                    break
        
        return recommendations
    
    def _get_chanting_guidelines(self) -> List[str]:
        """Get general chanting guidelines"""
        return [
            "Best time: Brahma Muhurta (4-6 AM) or Sunrise",
            "Sit in a clean, quiet place facing East or North",
            "Take bath and wear clean clothes before chanting",
            "Use a Rudraksha or Tulsi mala for counting",
            "Chant at least 108 times daily (one mala)",
            "On the planet's day, chant the special count (e.g., 7000 for Sun)",
            "Maintain consistency - don't skip days",
            "Avoid meat, alcohol, and negative thoughts during practice",
            "Complete at least 40 days for visible results",
            "For major issues, complete the full siddhi count over time"
        ]
    
    def _get_additional_practices(self) -> Dict:
        """Get additional remedy practices"""
        return {
            'meditation': "Meditate on the planet's deity while chanting",
            'donations': "Donate items related to the planet on its day",
            'fasting': "Fast on the planet's day for enhanced benefits",
            'puja': "Perform simple puja before chanting",
            'water_offering': "Offer water to Sun god at sunrise (for Sun mantra)",
            'lamp_lighting': "Light a lamp with ghee/sesame oil",
            'yantra': "Use the planet's yantra for focused energy",
            'rudraksha': "Wear appropriate Rudraksha bead"
        }
    
    def get_mantra_for_planet(self, planet: str) -> Dict:
        """Get mantra details for specific planet"""
        if planet not in self.MANTRA_DATA:
            raise ValueError(f"Invalid planet: {planet}")
        
        return self.MANTRA_DATA[planet]
    
    def get_all_mantras(self) -> Dict:
        """Get all mantra data"""
        return self.MANTRA_DATA


# Example usage
if __name__ == "__main__":
    suggester = MantraSuggestions()
    
    result = suggester.suggest_mantras(
        birth_date="1990-05-15",
        birth_time="14:30:00",
        birth_location="Mumbai, India",
        specific_issues=["career", "peace"]
    )
    
    print("Mantra Recommendations:")
    for rec in result['recommendations']:
        print(f"\n{rec['priority']}. {rec['planet']} Mantra")
        print(f"   Reason: {rec['reason']}")
        print(f"   Simple: {rec['simple_mantra']}")
        print(f"   Chant: {rec['repetitions']['daily']} times daily")
        print(f"   Best time: {rec['best_time']}")