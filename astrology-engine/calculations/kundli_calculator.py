# astrology-engine/calculations/kundli_calculator.py
# Kundli (Birth Chart) Calculator using Swiss Ephemeris

import swisseph as swe
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import math

# Initialize Swiss Ephemeris
swe.set_ephe_path('/usr/share/ephe')  # Set ephemeris data path

class KundliCalculator:
    """
    Calculate Vedic birth chart (Kundli) with planetary positions,
    house cusps, and divisional charts.
    """
    
    # Zodiac signs (12 signs)
    SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    # Planets (Vedic astrology order)
    PLANETS = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mars': swe.MARS,
        'Mercury': swe.MERCURY,
        'Jupiter': swe.JUPITER,
        'Venus': swe.VENUS,
        'Saturn': swe.SATURN,
        'Rahu': swe.MEAN_NODE,  # North Node
        'Ketu': swe.MEAN_NODE,  # South Node (180° from Rahu)
    }
    
    # Nakshatras (27 lunar mansions)
    NAKSHATRAS = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ]
    
    def __init__(self, ayanamsa: str = 'Lahiri'):
        """
        Initialize Kundli Calculator
        
        Args:
            ayanamsa: Ayanamsa system ('Lahiri', 'Raman', 'KP', etc.)
        """
        self.ayanamsa = ayanamsa
        self._set_ayanamsa(ayanamsa)
    
    def _set_ayanamsa(self, ayanamsa: str):
        """Set the ayanamsa (precession correction) system"""
        ayanamsa_map = {
            'Lahiri': swe.SIDM_LAHIRI,
            'Raman': swe.SIDM_RAMAN,
            'KP': swe.SIDM_KRISHNAMURTI,
            'Fagan': swe.SIDM_FAGAN_BRADLEY,
        }
        swe.set_sid_mode(ayanamsa_map.get(ayanamsa, swe.SIDM_LAHIRI))
    
    def _get_julian_day(self, date: datetime, time_zone: float = 0) -> float:
        """
        Convert datetime to Julian Day Number
        
        Args:
            date: Python datetime object
            time_zone: Timezone offset in hours (e.g., 5.5 for IST)
        
        Returns:
            Julian Day Number
        """
        # Adjust for timezone
        utc_time = date.hour + date.minute / 60.0 + date.second / 3600.0 - time_zone
        
        jd = swe.julday(
            date.year,
            date.month,
            date.day,
            utc_time
        )
        return jd
    
    def calculate_ascendant(self, jd: float, lat: float, lon: float) -> Dict:
        """
        Calculate Ascendant (Lagna)
        
        Args:
            jd: Julian Day Number
            lat: Latitude
            lon: Longitude
        
        Returns:
            Dictionary with ascendant details
        """
        # Calculate houses using Placidus system
        cusps, ascmc = swe.houses(jd, lat, lon, b'P')  # 'P' = Placidus
        
        # Ascendant is the first house cusp
        asc_tropical = cusps[0]
        
        # Convert to sidereal (Vedic)
        ayanamsa = swe.get_ayanamsa(jd)
        asc_sidereal = (asc_tropical - ayanamsa) % 360
        
        # Get sign and degree
        sign_num = int(asc_sidereal / 30)
        degree = asc_sidereal % 30
        
        return {
            'longitude': asc_sidereal,
            'sign': self.SIGNS[sign_num],
            'sign_num': sign_num + 1,
            'degree': degree,
            'formatted': f"{self.SIGNS[sign_num]} {degree:.2f}°"
        }
    
    def calculate_planet_position(self, jd: float, planet_id: int) -> Dict:
        """
        Calculate position of a planet
        
        Args:
            jd: Julian Day Number
            planet_id: Swiss Ephemeris planet ID
        
        Returns:
            Dictionary with planet details
        """
        # Calculate planet position
        result = swe.calc_ut(jd, planet_id)
        tropical_lon = result[0][0]
        
        # Convert to sidereal
        ayanamsa = swe.get_ayanamsa(jd)
        sidereal_lon = (tropical_lon - ayanamsa) % 360
        
        # Get sign and degree
        sign_num = int(sidereal_lon / 30)
        degree = sidereal_lon % 30
        
        # Check retrograde status
        speed = result[0][3]
        is_retrograde = speed < 0
        
        return {
            'longitude': sidereal_lon,
            'sign': self.SIGNS[sign_num],
            'sign_num': sign_num + 1,
            'degree': degree,
            'speed': speed,
            'is_retrograde': is_retrograde,
            'formatted': f"{self.SIGNS[sign_num]} {degree:.2f}°{' (R)' if is_retrograde else ''}"
        }
    
    def calculate_nakshatra(self, longitude: float) -> Dict:
        """
        Calculate Nakshatra from longitude
        
        Args:
            longitude: Sidereal longitude in degrees
        
        Returns:
            Dictionary with nakshatra details
        """
        # Each nakshatra is 13°20' (13.333°)
        nakshatra_span = 360 / 27
        nakshatra_num = int(longitude / nakshatra_span)
        pada = int((longitude % nakshatra_span) / (nakshatra_span / 4)) + 1
        
        return {
            'nakshatra': self.NAKSHATRAS[nakshatra_num],
            'nakshatra_num': nakshatra_num + 1,
            'pada': pada,
            'formatted': f"{self.NAKSHATRAS[nakshatra_num]} - Pada {pada}"
        }
    
    def calculate_house_cusps(self, jd: float, lat: float, lon: float) -> List[Dict]:
        """
        Calculate all 12 house cusps
        
        Args:
            jd: Julian Day Number
            lat: Latitude
            lon: Longitude
        
        Returns:
            List of 12 house cusp dictionaries
        """
        cusps, ascmc = swe.houses(jd, lat, lon, b'P')
        ayanamsa = swe.get_ayanamsa(jd)
        
        house_list = []
        for i in range(12):
            tropical_cusp = cusps[i]
            sidereal_cusp = (tropical_cusp - ayanamsa) % 360
            
            sign_num = int(sidereal_cusp / 30)
            degree = sidereal_cusp % 30
            
            house_list.append({
                'house_num': i + 1,
                'longitude': sidereal_cusp,
                'sign': self.SIGNS[sign_num],
                'sign_num': sign_num + 1,
                'degree': degree,
                'formatted': f"House {i + 1}: {self.SIGNS[sign_num]} {degree:.2f}°"
            })
        
        return house_list
    
    def calculate_all_planets(self, jd: float) -> Dict[str, Dict]:
        """
        Calculate positions of all planets
        
        Args:
            jd: Julian Day Number
        
        Returns:
            Dictionary of planet positions
        """
        planets_data = {}
        
        for planet_name, planet_id in self.PLANETS.items():
            if planet_name == 'Ketu':
                # Ketu is 180° from Rahu
                rahu_data = planets_data.get('Rahu')
                if rahu_data:
                    ketu_lon = (rahu_data['longitude'] + 180) % 360
                    sign_num = int(ketu_lon / 30)
                    degree = ketu_lon % 30
                    
                    planets_data['Ketu'] = {
                        'longitude': ketu_lon,
                        'sign': self.SIGNS[sign_num],
                        'sign_num': sign_num + 1,
                        'degree': degree,
                        'speed': -rahu_data['speed'],
                        'is_retrograde': True,  # Ketu is always retrograde
                        'formatted': f"{self.SIGNS[sign_num]} {degree:.2f}° (R)"
                    }
            else:
                planets_data[planet_name] = self.calculate_planet_position(jd, planet_id)
                
                # Add nakshatra for Moon
                if planet_name == 'Moon':
                    planets_data[planet_name]['nakshatra'] = self.calculate_nakshatra(
                        planets_data[planet_name]['longitude']
                    )
        
        return planets_data
    
    def generate_rasi_chart(self, planets: Dict, ascendant: Dict) -> Dict:
        """
        Generate D1 Rasi Chart (Birth Chart)
        
        Args:
            planets: Dictionary of planet positions
            ascendant: Ascendant details
        
        Returns:
            Dictionary representing the chart with planets in houses
        """
        chart = {i: [] for i in range(1, 13)}  # 12 houses
        
        # Place Ascendant
        asc_house = ascendant['sign_num']
        
        # Place planets in houses
        for planet_name, planet_data in planets.items():
            # Calculate house number relative to ascendant
            planet_sign = planet_data['sign_num']
            house_num = ((planet_sign - asc_house) % 12) + 1
            
            chart[house_num].append({
                'planet': planet_name,
                'degree': planet_data['degree'],
                'is_retrograde': planet_data.get('is_retrograde', False)
            })
        
        return chart
    
    def generate_navamsa_chart(self, planets: Dict, ascendant: Dict) -> Dict:
        """
        Generate D9 Navamsa Chart (Marriage & Spiritual Chart)
        
        Args:
            planets: Dictionary of planet positions
            ascendant: Ascendant details
        
        Returns:
            Dictionary representing the Navamsa chart
        """
        chart = {i: [] for i in range(1, 13)}
        
        # Calculate Navamsa positions (each sign divided into 9 parts)
        def get_navamsa_position(longitude: float) -> int:
            # Each navamsa is 3°20' (3.333°)
            navamsa_num = int(longitude / 3.333333)
            return (navamsa_num % 12) + 1
        
        # Navamsa ascendant
        navamsa_asc = get_navamsa_position(ascendant['longitude'])
        
        # Place planets in Navamsa
        for planet_name, planet_data in planets.items():
            navamsa_sign = get_navamsa_position(planet_data['longitude'])
            house_num = ((navamsa_sign - navamsa_asc) % 12) + 1
            
            chart[house_num].append({
                'planet': planet_name,
                'navamsa_sign': navamsa_sign,
                'is_retrograde': planet_data.get('is_retrograde', False)
            })
        
        return chart
    
    def generate_kundli(
        self,
        birth_date: datetime,
        latitude: float,
        longitude: float,
        timezone: float
    ) -> Dict:
        """
        Generate complete Kundli
        
        Args:
            birth_date: Birth date and time
            latitude: Birth place latitude
            longitude: Birth place longitude
            timezone: Timezone offset in hours
        
        Returns:
            Complete Kundli dictionary
        """
        # Calculate Julian Day
        jd = self._get_julian_day(birth_date, timezone)
        
        # Calculate Ascendant
        ascendant = self.calculate_ascendant(jd, latitude, longitude)
        
        # Calculate all planets
        planets = self.calculate_all_planets(jd)
        
        # Calculate house cusps
        houses = self.calculate_house_cusps(jd, latitude, longitude)
        
        # Generate charts
        rasi_chart = self.generate_rasi_chart(planets, ascendant)
        navamsa_chart = self.generate_navamsa_chart(planets, ascendant)
        
        # Moon sign (Rashi)
        moon_sign = planets['Moon']['sign']
        moon_nakshatra = planets['Moon']['nakshatra']
        
        return {
            'birth_details': {
                'date': birth_date.strftime('%Y-%m-%d'),
                'time': birth_date.strftime('%H:%M:%S'),
                'latitude': latitude,
                'longitude': longitude,
                'timezone': timezone,
                'ayanamsa': self.ayanamsa,
            },
            'ascendant': ascendant,
            'planets': planets,
            'houses': houses,
            'rasi_chart': rasi_chart,
            'navamsa_chart': navamsa_chart,
            'moon_sign': moon_sign,
            'sun_sign': planets['Sun']['sign'],
            'moon_nakshatra': moon_nakshatra,
        }


# Example usage
if __name__ == "__main__":
    # Example: Calculate Kundli
    calculator = KundliCalculator(ayanamsa='Lahiri')

    birth_date = datetime(1990, 5, 15, 14, 30)  # May 15, 1990, 2:30 PM
    latitude = 28.6139  # Delhi
    longitude = 77.2090
    timezone = 5.5  # IST
    
    kundli = calculator.generate_kundli(birth_date, latitude, longitude, timezone)
    
    print("Ascendant:", kundli['ascendant']['formatted'])
    print("Moon Sign:", kundli['moon_sign'])
    print("Sun Sign:", kundli['sun_sign'])
    print("Moon Nakshatra:", kundli['moon_nakshatra']['formatted'])