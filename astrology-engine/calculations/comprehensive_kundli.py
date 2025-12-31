# astrology-engine/calculations/comprehensive_kundli.py
# Comprehensive Kundli Generator - Combines All Calculations

import swisseph as swe
from typing import Dict, List, Optional
from datetime import datetime
from .divisional_charts import DivisionalChartsCalculator
from .house_analysis import HouseAnalyzer
from .dasha_calculator import DashaCalculator
from .planetary_positions import PlanetaryPositions

class ComprehensiveKundliGenerator:
    """
    Generate complete comprehensive kundli with:
    - Basic planetary positions
    - All 16 divisional charts (Shodashvarga)
    - House analysis (12 bhavas)
    - Vimshottari Dasha timeline
    """
    
    PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
    
    def __init__(self):
        """Initialize all calculators"""
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        self.divisional_calc = DivisionalChartsCalculator()
        self.house_analyzer = HouseAnalyzer()
        self.dasha_calc = DashaCalculator()
        self.planet_calc = PlanetaryPositions()
    
    def _get_julian_day(self, date_str: str, time_str: str, timezone: float) -> float:
        """Convert date/time to Julian Day"""
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        utc_dt = dt.replace(
            hour=dt.hour - int(timezone),
            minute=dt.minute - int((timezone % 1) * 60)
        )
        
        return swe.julday(
            utc_dt.year,
            utc_dt.month,
            utc_dt.day,
            utc_dt.hour + utc_dt.minute / 60.0
        )
    
    def generate_comprehensive_kundli(
        self,
        birth_date: str,
        birth_time: str,
        latitude: float,
        longitude: float,
        timezone: float = 5.5,
        name: Optional[str] = None,
        place: Optional[str] = None
    ) -> Dict:
        """
        Generate comprehensive kundli with all features
        
        Args:
            birth_date: YYYY-MM-DD
            birth_time: HH:MM
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Timezone offset (default 5.5 for IST)
            name: Person's name
            place: Birth place
        
        Returns:
            Complete kundli data dictionary
        """
        
        # Calculate Julian Day
        jd = self._get_julian_day(birth_date, birth_time, timezone)
        
        # 1. Calculate basic planetary positions
        planets = self.planet_calc.calculate_all_planets(jd, latitude, longitude)
        
        # 2. Calculate Shodashvarga (16 divisional charts) for all planets
        shodashvarga = {}
        for planet_name, planet_data in planets.items():
            if planet_name in self.PLANETS:
                charts = self.divisional_calc.calculate_all_divisional_charts(
                    planet_data['longitude']
                )
                shodashvarga[planet_name] = charts
        
        # 3. Analyze all 12 houses
        house_analysis = self.house_analyzer.analyze_all_houses(
            jd, latitude, longitude, planets
        )
        
        # 4. Calculate Vimshottari Dasha
        moon_longitude = planets['Moon']['longitude']
        dasha_timeline = self.dasha_calc.calculate_vimshottari_dasha(
            birth_date, birth_time, moon_longitude
        )
        
        # 5. Get current dasha
        current_dasha = self.dasha_calc.get_current_dasha(dasha_timeline)
        
        # Compile comprehensive result
        return {
            'basic_info': {
                'name': name,
                'birth_date': birth_date,
                'birth_time': birth_time,
                'birth_place': place,
                'latitude': latitude,
                'longitude': longitude,
                'timezone': timezone,
                'julian_day': jd
            },
            'planetary_positions': planets,
            'shodashvarga_table': shodashvarga,
            'house_analysis': house_analysis,
            'dasha': {
                'current': current_dasha,
                'complete_timeline': dasha_timeline
            },
            'generated_at': datetime.now().isoformat()
        }


# Test function
if __name__ == "__main__":
    generator = ComprehensiveKundliGenerator()
    
    kundli = generator.generate_comprehensive_kundli(
        birth_date='1990-05-15',
        birth_time='14:30',
        latitude=19.0760,
        longitude=72.8777,
        timezone=5.5,
        name='Test User',
        place='Mumbai, India'
    )
    
    print("Comprehensive Kundli Generated!")
    print(f"Planets: {len(kundli['planetary_positions'])}")
    print(f"Shodashvarga entries: {len(kundli['shodashvarga_table'])}")
    print(f"Houses analyzed: {len(kundli['house_analysis'])}")