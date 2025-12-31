# astrology-engine/calculations/base_calculator.py
# Shared utilities for all horoscope generators

import swisseph as swe
from datetime import datetime
from typing import Dict, Optional
import requests

class BaseCalculator:
    """
    Base calculator with shared utilities for all horoscope generators.
    Handles geocoding, planetary positions, houses, and common calculations.
    """
    
    SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    PLANETS = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mars': swe.MARS,
        'Mercury': swe.MERCURY,
        'Jupiter': swe.JUPITER,
        'Venus': swe.VENUS,
        'Saturn': swe.SATURN,
        'Rahu': swe.MEAN_NODE
    }
    
    def __init__(self):
        """Initialize base calculator with Lahiri ayanamsa"""
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    def get_coordinates_from_location(self, location_name: str) -> Dict:
        """
        Get latitude/longitude from location name using Nominatim (OpenStreetMap)
        
        Args:
            location_name: City name, e.g., "Mumbai, India"
        
        Returns:
            Dict with latitude, longitude, timezone, display_name
        """
        try:
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
        """Estimate timezone from longitude"""
        # India range
        if 68 <= longitude <= 97:
            return 'Asia/Kolkata'
        # Rough estimation for other regions
        tz_offset = round(longitude / 15)
        return f'UTC{tz_offset:+d}'
    
    def calculate_julian_day(self, date_obj: datetime) -> float:
        """Convert datetime to Julian Day Number"""
        return swe.julday(
            date_obj.year,
            date_obj.month,
            date_obj.day,
            date_obj.hour + date_obj.minute / 60.0 + date_obj.second / 3600.0
        )
    
    def get_planetary_position(self, jd: float, planet_id: int) -> Dict:
        """
        Get planet position at given Julian Day
        
        Args:
            jd: Julian Day Number
            planet_id: Swiss Ephemeris planet constant
        
        Returns:
            Dict with longitude, sign, degree, speed, is_retrograde
        """
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
    
    def get_all_planets(self, jd: float) -> Dict:
        """Get positions of all major planets"""
        planets = {}
        for name, planet_id in self.PLANETS.items():
            planets[name] = self.get_planetary_position(jd, planet_id)
        
        # Add Ketu (180° from Rahu)
        rahu_lon = planets['Rahu']['longitude']
        ketu_lon = (rahu_lon + 180) % 360
        ketu_sign_num = int(ketu_lon / 30)
        
        planets['Ketu'] = {
            'longitude': ketu_lon,
            'sign': self.SIGNS[ketu_sign_num],
            'sign_num': ketu_sign_num + 1,
            'degree': ketu_lon % 30,
            'speed': -planets['Rahu']['speed'],
            'is_retrograde': True
        }
        
        return planets
    
    def calculate_ascendant(self, jd: float, latitude: float, longitude: float) -> Dict:
        """
        Calculate Ascendant (Lagna)
        
        Args:
            jd: Julian Day Number
            latitude: Geographic latitude
            longitude: Geographic longitude
        
        Returns:
            Dict with ascendant details
        """
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
    
    def calculate_house_cusps(self, jd: float, latitude: float, longitude: float) -> list:
        """
        Calculate all 12 house cusps
        
        Returns:
            List of 12 house cusp longitudes (sidereal)
        """
        house_cusps, ascmc = swe.houses(jd, latitude, longitude, b'P')
        ayanamsa = swe.get_ayanamsa(jd)
        
        cusps = []
        for i in range(12):
            tropical_cusp = house_cusps[i]
            sidereal_cusp = (tropical_cusp - ayanamsa) % 360
            cusps.append(sidereal_cusp)
        
        return cusps
    
    def calculate_house_from_ascendant(self, planet_lon: float, asc_lon: float) -> int:
        """
        Calculate which house a planet occupies from Ascendant
        
        Args:
            planet_lon: Planet's longitude
            asc_lon: Ascendant longitude
        
        Returns:
            House number (1-12)
        """
        diff = (planet_lon - asc_lon) % 360
        house = int(diff / 30) + 1
        return house
    
    def calculate_nakshatra(self, longitude: float) -> Dict:
        """
        Calculate nakshatra from longitude
        
        Args:
            longitude: Sidereal longitude (0-360)
        
        Returns:
            Dict with nakshatra number, name, pada
        """
        NAKSHATRAS = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ]
        
        nakshatra_span = 360 / 27  # 13.333333°
        nakshatra_num = int(longitude / nakshatra_span)
        
        # Pada calculation (each nakshatra has 4 padas)
        position_in_nakshatra = longitude % nakshatra_span
        pada = int(position_in_nakshatra / (nakshatra_span / 4)) + 1
        
        return {
            'number': nakshatra_num + 1,
            'name': NAKSHATRAS[nakshatra_num],
            'pada': pada,
            'lord': self._get_nakshatra_lord(nakshatra_num)
        }
    
    def _get_nakshatra_lord(self, nakshatra_num: int) -> str:
        """Get ruling planet of nakshatra"""
        lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
        return lords[nakshatra_num % 9]
    
    def parse_birth_datetime(self, birth_date: str, birth_time: str) -> datetime:
        """
        Parse birth date and time strings into datetime object
        
        Args:
            birth_date: 'YYYY-MM-DD'
            birth_time: 'HH:MM:SS'
        
        Returns:
            datetime object
        """
        return datetime.strptime(
            f"{birth_date} {birth_time}",
            "%Y-%m-%d %H:%M:%S"
        )
    
    def handle_geocoding(
        self,
        birth_location: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        timezone: Optional[str]
    ) -> Dict:
        """
        Handle geocoding logic - either use provided coords or geocode location
        
        Returns:
            Dict with latitude, longitude, timezone
        """
        if latitude is not None and longitude is not None:
            return {
                'latitude': latitude,
                'longitude': longitude,
                'timezone': timezone or self._estimate_timezone(longitude),
                'location': birth_location or f"{latitude}, {longitude}"
            }
        
        if birth_location is None:
            raise ValueError("Either birth_location or latitude/longitude must be provided")
        
        geo_data = self.get_coordinates_from_location(birth_location)
        return {
            'latitude': geo_data['latitude'],
            'longitude': geo_data['longitude'],
            'timezone': geo_data['timezone'],
            'location': geo_data['display_name']
        }
    
    def calculate_planet_strength_simple(self, planet_data: Dict) -> Dict:
        """
        Simple planet strength calculation (for quick scoring)
        
        Args:
            planet_data: Planet position dict
        
        Returns:
            Dict with strength info
        """
        sign = planet_data['sign']
        degree = planet_data['degree']
        is_retrograde = planet_data['is_retrograde']
        
        strength = 50  # Base strength
        status = 'neutral'
        
        # Check exaltation/debilitation (simplified)
        exaltation_signs = {
            'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn',
            'Mercury': 'Virgo', 'Jupiter': 'Cancer', 'Venus': 'Pisces', 'Saturn': 'Libra'
        }
        
        debilitation_signs = {
            'Sun': 'Libra', 'Moon': 'Scorpio', 'Mars': 'Cancer',
            'Mercury': 'Pisces', 'Jupiter': 'Capricorn', 'Venus': 'Virgo', 'Saturn': 'Aries'
        }
        
        # Check if planet has exaltation/debilitation info
        planet_name = None
        for name, data in exaltation_signs.items():
            if data == sign:
                strength = 90
                status = 'exalted'
                break
        
        for name, data in debilitation_signs.items():
            if data == sign:
                strength = 25
                status = 'debilitated'
                break
        
        # Retrograde reduces strength
        if is_retrograde and status == 'neutral':
            strength -= 15
            status = 'retrograde'
        
        return {
            'strength': strength,
            'status': status,
            'description': f"Planet is {status}"
        }
    
    def get_aspect_angle(self, lon1: float, lon2: float) -> float:
        """Calculate angular distance between two longitudes"""
        diff = abs(lon1 - lon2)
        if diff > 180:
            diff = 360 - diff
        return diff
    
    def check_aspect(self, lon1: float, lon2: float, orb: float = 8) -> Optional[str]:
        """
        Check if there's a major aspect between two planets
        
        Args:
            lon1: First planet longitude
            lon2: Second planet longitude
            orb: Orb of influence (default 8°)
        
        Returns:
            Aspect type or None
        """
        angle = self.get_aspect_angle(lon1, lon2)
        
        if angle <= orb:
            return 'Conjunction'
        elif 172 <= angle <= 188:
            return 'Opposition'
        elif 114 <= angle <= 126:
            return 'Trine'
        elif 84 <= angle <= 96:
            return 'Square'
        elif 54 <= angle <= 66:
            return 'Sextile'
        
        return None
    
    def format_degree(self, degree: float) -> str:
        """Format degree as degrees-minutes-seconds"""
        d = int(degree)
        m = int((degree - d) * 60)
        s = int(((degree - d) * 60 - m) * 60)
        return f"{d}°{m}'{s}\""


# Example usage
if __name__ == "__main__":
    calc = BaseCalculator()
    
    # Test geocoding
    geo = calc.get_coordinates_from_location("Mumbai, India")
    print(f"Mumbai coordinates: {geo['latitude']}, {geo['longitude']}")
    
    # Test planetary positions
    now = datetime.now()
    jd = calc.calculate_julian_day(now)
    planets = calc.get_all_planets(jd)
    
    print(f"\nCurrent Sun position: {planets['Sun']['sign']} {planets['Sun']['degree']:.2f}°")
    print(f"Current Moon position: {planets['Moon']['sign']} {planets['Moon']['degree']:.2f}°")