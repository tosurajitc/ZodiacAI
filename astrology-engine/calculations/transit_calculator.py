# astrology-engine/calculations/transit_calculator.py
# Transit Calculator - Current Planetary Movements and Their Effects

import swisseph as swe
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

class TransitCalculator:
    """
    Calculate current planetary transits, their effects on natal chart,
    Sade Sati, Jupiter transit, and other important transit phenomena.
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
        'Rahu': swe.MEAN_NODE,
    }
    
    # Average transit durations (approximate)
    TRANSIT_DURATIONS = {
        'Sun': {'days': 30, 'description': '1 month per sign'},
        'Moon': {'days': 2.5, 'description': '2.5 days per sign'},
        'Mars': {'days': 45, 'description': '1.5 months per sign'},
        'Mercury': {'days': 25, 'description': '25 days per sign (varies due to retrogression)'},
        'Jupiter': {'days': 365, 'description': '1 year per sign'},
        'Venus': {'days': 28, 'description': '28 days per sign (varies due to retrogression)'},
        'Saturn': {'days': 912, 'description': '2.5 years per sign'},
        'Rahu': {'days': 547, 'description': '1.5 years per sign (retrograde motion)'},
        'Ketu': {'days': 547, 'description': '1.5 years per sign (retrograde motion)'},
    }
    
    def __init__(self):
        """Initialize Transit Calculator"""
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    def _get_julian_day(self, date: datetime) -> float:
        """Convert datetime to Julian Day"""
        jd = swe.julday(
            date.year,
            date.month,
            date.day,
            date.hour + date.minute / 60.0
        )
        return jd
    
    def get_current_transits(self, date: datetime = None) -> Dict:
        """
        Get current planetary positions (transits)
        
        Args:
            date: Date to check (default: today)
        
        Returns:
            Dictionary of current planet positions
        """
        if date is None:
            date = datetime.now()
        
        jd = self._get_julian_day(date)
        ayanamsa = swe.get_ayanamsa(jd)
        
        transits = {}
        
        for planet_name, planet_id in self.PLANETS.items():
            result = swe.calc_ut(jd, planet_id)
            tropical_lon = result[0][0]
            sidereal_lon = (tropical_lon - ayanamsa) % 360
            
            sign_num = int(sidereal_lon / 30)
            degree = sidereal_lon % 30
            speed = result[0][3]
            
            transits[planet_name] = {
                'longitude': sidereal_lon,
                'sign': self.SIGNS[sign_num],
                'sign_num': sign_num + 1,
                'degree': degree,
                'speed': speed,
                'is_retrograde': speed < 0,
                'formatted': f"{self.SIGNS[sign_num]} {degree:.2f}°{' (R)' if speed < 0 else ''}"
            }
        
        # Add Ketu (180° from Rahu)
        rahu_lon = transits['Rahu']['longitude']
        ketu_lon = (rahu_lon + 180) % 360
        ketu_sign_num = int(ketu_lon / 30)
        
        transits['Ketu'] = {
            'longitude': ketu_lon,
            'sign': self.SIGNS[ketu_sign_num],
            'sign_num': ketu_sign_num + 1,
            'degree': ketu_lon % 30,
            'speed': -transits['Rahu']['speed'],
            'is_retrograde': True,
            'formatted': f"{self.SIGNS[ketu_sign_num]} {ketu_lon % 30:.2f}° (R)"
        }
        
        return transits
    
    def calculate_transit_from_moon(
        self,
        transit_planet_sign: int,
        natal_moon_sign: int
    ) -> int:
        """
        Calculate house position of transit planet from natal Moon
        
        Args:
            transit_planet_sign: Current sign of transiting planet (1-12)
            natal_moon_sign: Natal Moon sign (1-12)
        
        Returns:
            House number from Moon (1-12)
        """
        house = ((transit_planet_sign - natal_moon_sign) % 12) + 1
        return house
    
    def check_sade_sati(
        self,
        natal_moon_sign: int,
        current_saturn_sign: int
    ) -> Dict:
        """
        Check if person is going through Sade Sati (7.5 year Saturn period)
        
        Args:
            natal_moon_sign: Natal Moon sign (1-12)
            current_saturn_sign: Current Saturn sign (1-12)
        
        Returns:
            Dictionary with Sade Sati status
        """
        # Sade Sati occurs when Saturn transits:
        # 12th sign from Moon (1st phase - Rising)
        # Moon sign itself (2nd phase - Peak)
        # 2nd sign from Moon (3rd phase - Setting)
        
        phase_1 = (natal_moon_sign - 1) if natal_moon_sign > 1 else 12
        phase_2 = natal_moon_sign
        phase_3 = (natal_moon_sign % 12) + 1
        
        in_sade_sati = False
        current_phase = None
        phase_description = ''
        
        if current_saturn_sign == phase_1:
            in_sade_sati = True
            current_phase = 1
            phase_description = 'Rising Phase (12th from Moon) - Initial challenges'
        elif current_saturn_sign == phase_2:
            in_sade_sati = True
            current_phase = 2
            phase_description = 'Peak Phase (on Moon) - Maximum intensity'
        elif current_saturn_sign == phase_3:
            in_sade_sati = True
            current_phase = 3
            phase_description = 'Setting Phase (2nd from Moon) - Challenges reducing'
        
        return {
            'in_sade_sati': in_sade_sati,
            'phase': current_phase,
            'phase_description': phase_description,
            'saturn_sign': self.SIGNS[current_saturn_sign - 1],
            'moon_sign': self.SIGNS[natal_moon_sign - 1],
            'duration': '2.5 years per phase, 7.5 years total',
            'effects': self._get_sade_sati_effects(current_phase) if in_sade_sati else None
        }
    
    def _get_sade_sati_effects(self, phase: int) -> Dict:
        """Get effects for each Sade Sati phase"""
        effects = {
            1: {
                'general': 'New challenges, obstacles begin',
                'career': 'Work pressure increases',
                'health': 'Minor health issues possible',
                'advice': 'Stay patient, avoid major decisions'
            },
            2: {
                'general': 'Maximum challenges, testing period',
                'career': 'Career obstacles, delays',
                'health': 'Health needs attention',
                'advice': 'Focus on resilience, spiritual practices'
            },
            3: {
                'general': 'Challenges reducing, light at end',
                'career': 'Gradual improvement',
                'health': 'Recovery begins',
                'advice': 'Maintain caution, continue good practices'
            }
        }
        return effects.get(phase, {})
    
    def check_jupiter_transit(
        self,
        natal_moon_sign: int,
        current_jupiter_sign: int
    ) -> Dict:
        """
        Check Jupiter transit effects (12-year cycle)
        
        Args:
            natal_moon_sign: Natal Moon sign (1-12)
            current_jupiter_sign: Current Jupiter sign (1-12)
        
        Returns:
            Dictionary with Jupiter transit effects
        """
        house_from_moon = self.calculate_transit_from_moon(
            current_jupiter_sign,
            natal_moon_sign
        )
        
        # Beneficial houses for Jupiter transit: 2, 5, 7, 9, 11
        beneficial_houses = [2, 5, 7, 9, 11]
        is_beneficial = house_from_moon in beneficial_houses
        
        house_effects = {
            1: 'Health, personality development, new beginnings',
            2: 'Wealth gains, family happiness (BENEFICIAL)',
            3: 'Efforts required, communication increases',
            4: 'Property matters, mother\'s health needs attention',
            5: 'Children, creativity, intelligence enhanced (BENEFICIAL)',
            6: 'Enemies defeated, health improves (Unexpected benefits)',
            7: 'Marriage, partnerships favorable (BENEFICIAL)',
            8: 'Transformation, research, inheritance possible',
            9: 'Fortune, spirituality, father\'s blessings (BENEFICIAL)',
            10: 'Career challenges initially, then improvements',
            11: 'Gains, ambitions fulfilled, income increases (BENEFICIAL)',
            12: 'Expenses, foreign travel, spiritual growth'
        }
        
        return {
            'jupiter_sign': self.SIGNS[current_jupiter_sign - 1],
            'moon_sign': self.SIGNS[natal_moon_sign - 1],
            'house_from_moon': house_from_moon,
            'is_beneficial': is_beneficial,
            'effects': house_effects.get(house_from_moon, 'General effects'),
            'duration': '1 year in this position',
            'next_sign_date': 'Approximately in 1 year'
        }
    
    def analyze_transit_aspects(
        self,
        transits: Dict,
        natal_planets: Dict
    ) -> List[Dict]:
        """
        Analyze aspects between transiting and natal planets
        
        Args:
            transits: Current transit positions
            natal_planets: Natal planet positions
        
        Returns:
            List of significant aspects
        """
        aspects = []
        
        # Check major aspects (conjunction, opposition, trine, square)
        for transit_planet, transit_data in transits.items():
            if transit_planet in ['Rahu', 'Ketu']:
                continue
                
            for natal_planet, natal_data in natal_planets.items():
                if natal_planet in ['Rahu', 'Ketu']:
                    continue
                
                # Calculate angular distance
                transit_lon = transit_data['longitude']
                natal_lon = natal_data['longitude']
                
                diff = abs(transit_lon - natal_lon)
                if diff > 180:
                    diff = 360 - diff
                
                aspect_type = None
                orb_used = 0
                
                # Conjunction (0°, orb ±8°)
                if diff <= 8:
                    aspect_type = 'Conjunction'
                    orb_used = diff
                
                # Opposition (180°, orb ±8°)
                elif 172 <= diff <= 188:
                    aspect_type = 'Opposition'
                    orb_used = abs(180 - diff)
                
                # Trine (120°, orb ±6°)
                elif 114 <= diff <= 126:
                    aspect_type = 'Trine'
                    orb_used = abs(120 - diff)
                
                # Square (90°, orb ±6°)
                elif 84 <= diff <= 96:
                    aspect_type = 'Square'
                    orb_used = abs(90 - diff)
                
                if aspect_type:
                    aspects.append({
                        'transit_planet': transit_planet,
                        'natal_planet': natal_planet,
                        'aspect_type': aspect_type,
                        'orb': orb_used,
                        'is_applying': True,  # Simplified
                        'significance': self._get_aspect_significance(
                            transit_planet,
                            natal_planet,
                            aspect_type
                        )
                    })
        
        return aspects
    
    def _get_aspect_significance(
        self,
        transit_planet: str,
        natal_planet: str,
        aspect_type: str
    ) -> str:
        """Get significance of transit-natal aspect"""
        if aspect_type in ['Conjunction', 'Trine']:
            return f'{transit_planet} harmoniously aspects natal {natal_planet}'
        elif aspect_type in ['Opposition', 'Square']:
            return f'{transit_planet} challenges natal {natal_planet}'
        return 'Neutral aspect'
    
    def get_important_transit_dates(
        self,
        start_date: datetime,
        days_ahead: int = 365
    ) -> List[Dict]:
        """
        Get important upcoming transit dates
        
        Args:
            start_date: Starting date
            days_ahead: Number of days to look ahead
        
        Returns:
            List of important transit events
        """
        important_dates = []
        
        # Check Saturn sign changes (every ~2.5 years)
        # Check Jupiter sign changes (every ~1 year)
        # Check Mars sign changes (every ~45 days)
        # Check eclipses
        # Check retrograde periods
        
        # Simplified implementation - check sign changes
        current_date = start_date
        end_date = start_date + timedelta(days=days_ahead)
        
        # Get initial positions
        prev_transits = self.get_current_transits(current_date)
        
        # Check every 10 days
        while current_date <= end_date:
            current_transits = self.get_current_transits(current_date)
            
            # Check for sign changes
            for planet in ['Jupiter', 'Saturn', 'Mars']:
                if prev_transits[planet]['sign'] != current_transits[planet]['sign']:
                    important_dates.append({
                        'date': current_date.strftime('%Y-%m-%d'),
                        'event': f'{planet} enters {current_transits[planet]["sign"]}',
                        'type': 'sign_change',
                        'planet': planet,
                        'significance': 'High' if planet in ['Jupiter', 'Saturn'] else 'Medium'
                    })
            
            prev_transits = current_transits
            current_date += timedelta(days=10)
        
        return important_dates
    
    def generate_transit_report(
        self,
        natal_moon_sign: int,
        natal_planets: Dict,
        current_date: datetime = None
    ) -> Dict:
        """
        Generate comprehensive transit report
        
        Args:
            natal_moon_sign: Natal Moon sign (1-12)
            natal_planets: Natal planet positions
            current_date: Date to check (default: today)
        
        Returns:
            Complete transit report
        """
        if current_date is None:
            current_date = datetime.now()
        
        # Get current transits
        transits = self.get_current_transits(current_date)
        
        # Check Sade Sati
        sade_sati = self.check_sade_sati(
            natal_moon_sign,
            transits['Saturn']['sign_num']
        )
        
        # Check Jupiter transit
        jupiter_transit = self.check_jupiter_transit(
            natal_moon_sign,
            transits['Jupiter']['sign_num']
        )
        
        # Analyze aspects
        aspects = self.analyze_transit_aspects(transits, natal_planets)
        
        # Get important upcoming dates
        important_dates = self.get_important_transit_dates(current_date, 365)
        
        return {
            'date': current_date.strftime('%Y-%m-%d'),
            'current_transits': transits,
            'sade_sati': sade_sati,
            'jupiter_transit': jupiter_transit,
            'transit_aspects': aspects,
            'important_upcoming_dates': important_dates[:10],  # Top 10
            'summary': self._generate_transit_summary(
                sade_sati,
                jupiter_transit,
                aspects
            )
        }
    
    def _generate_transit_summary(
        self,
        sade_sati: Dict,
        jupiter_transit: Dict,
        aspects: List[Dict]
    ) -> Dict:
        """Generate summary of current transits"""
        summary = {
            'overall_period': 'Neutral',
            'key_influences': [],
            'recommendations': []
        }
        
        if sade_sati['in_sade_sati']:
            summary['key_influences'].append(
                f"Sade Sati Phase {sade_sati['phase']}: {sade_sati['phase_description']}"
            )
            summary['recommendations'].append(
                'Practice patience and spiritual disciplines during Sade Sati'
            )
        
        if jupiter_transit['is_beneficial']:
            summary['key_influences'].append(
                f"Jupiter transit favorable in house {jupiter_transit['house_from_moon']}"
            )
            summary['overall_period'] = 'Positive'
        
        # Count challenging aspects
        challenging_aspects = len([a for a in aspects if a['aspect_type'] in ['Opposition', 'Square']])
        
        if challenging_aspects > 3:
            summary['recommendations'].append(
                'Multiple challenging aspects - proceed with caution in important matters'
            )
        
        return summary


# Example usage
if __name__ == "__main__":
    calculator = TransitCalculator()
    
    # Get current transits
    transits = calculator.get_current_transits()
    print("Current Jupiter:", transits['Jupiter']['formatted'])
    print("Current Saturn:", transits['Saturn']['formatted'])
    
    # Check Sade Sati for someone with Moon in Taurus (2)
    sade_sati = calculator.check_sade_sati(2, transits['Saturn']['sign_num'])
    print("\nSade Sati Status:", sade_sati['in_sade_sati'])