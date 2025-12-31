# astrology-engine/calculations/dasha_calculator.py
# Vimshottari Dasha Calculator (120-year planetary period system)

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

class DashaCalculator:
    """
    Calculate Vimshottari Dasha periods based on Moon's nakshatra at birth.
    Vimshottari is the most popular dasha system in Vedic astrology.
    """
    
    # Dasha lords in order (120-year cycle)
    DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
    
    # Years for each Mahadasha
    DASHA_YEARS = {
        'Ketu': 7,
        'Venus': 20,
        'Sun': 6,
        'Moon': 10,
        'Mars': 7,
        'Rahu': 18,
        'Jupiter': 16,
        'Saturn': 19,
        'Mercury': 17,
    }
    
    # 27 Nakshatras and their ruling planets
    NAKSHATRA_LORDS = [
        'Ketu',    # 1. Ashwini
        'Venus',   # 2. Bharani
        'Sun',     # 3. Krittika
        'Moon',    # 4. Rohini
        'Mars',    # 5. Mrigashira
        'Rahu',    # 6. Ardra
        'Jupiter', # 7. Punarvasu
        'Saturn',  # 8. Pushya
        'Mercury', # 9. Ashlesha
        'Ketu',    # 10. Magha
        'Venus',   # 11. Purva Phalguni
        'Sun',     # 12. Uttara Phalguni
        'Moon',    # 13. Hasta
        'Mars',    # 14. Chitra
        'Rahu',    # 15. Swati
        'Jupiter', # 16. Vishakha
        'Saturn',  # 17. Anuradha
        'Mercury', # 18. Jyeshtha
        'Ketu',    # 19. Mula
        'Venus',   # 20. Purva Ashadha
        'Sun',     # 21. Uttara Ashadha
        'Moon',    # 22. Shravana
        'Mars',    # 23. Dhanishta
        'Rahu',    # 24. Shatabhisha
        'Jupiter', # 25. Purva Bhadrapada
        'Saturn',  # 26. Uttara Bhadrapada
        'Mercury', # 27. Revati
    ]
    
    NAKSHATRA_NAMES = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ]
    
    def __init__(self):
        """Initialize Dasha Calculator"""
        pass
    
    def get_nakshatra_from_moon(self, moon_longitude: float) -> Tuple[int, str, float]:
        """
        Get nakshatra number and lord from Moon's longitude
        
        Args:
            moon_longitude: Moon's sidereal longitude (0-360)
        
        Returns:
            Tuple of (nakshatra_number, nakshatra_name, balance_percentage)
        """
        # Each nakshatra is 13°20' (13.333333°)
        nakshatra_span = 360 / 27
        
        # Find nakshatra number (0-26)
        nakshatra_num = int(moon_longitude / nakshatra_span)
        
        # Find position within nakshatra (0-100%)
        position_in_nakshatra = (moon_longitude % nakshatra_span) / nakshatra_span
        
        # Balance remaining (100% - position)
        balance = 1 - position_in_nakshatra
        
        nakshatra_name = self.NAKSHATRA_NAMES[nakshatra_num]
        
        return nakshatra_num, nakshatra_name, balance
    
    def get_birth_dasha_lord(self, moon_longitude: float) -> str:
        """
        Get the Mahadasha lord at birth based on Moon's nakshatra
        
        Args:
            moon_longitude: Moon's sidereal longitude
        
        Returns:
            Name of the Mahadasha lord
        """
        nakshatra_num, _, _ = self.get_nakshatra_from_moon(moon_longitude)
        return self.NAKSHATRA_LORDS[nakshatra_num]
    
    def calculate_balance_dasha(
        self,
        moon_longitude: float,
        birth_date: datetime
    ) -> Tuple[str, datetime, datetime, float]:
        """
        Calculate the balance of birth Mahadasha
        
        Args:
            moon_longitude: Moon's sidereal longitude
            birth_date: Birth datetime
        
        Returns:
            Tuple of (dasha_lord, start_date, end_date, remaining_years)
        """
        nakshatra_num, nakshatra_name, balance = self.get_nakshatra_from_moon(moon_longitude)
        dasha_lord = self.NAKSHATRA_LORDS[nakshatra_num]
        
        # Total years for this dasha
        total_years = self.DASHA_YEARS[dasha_lord]
        
        # Remaining years
        remaining_years = total_years * balance
        
        # Calculate end date
        days_remaining = int(remaining_years * 365.25)
        end_date = birth_date + timedelta(days=days_remaining)
        
        return dasha_lord, birth_date, end_date, remaining_years
    
    def calculate_mahadasha_sequence(
        self,
        birth_dasha_lord: str,
        start_date: datetime,
        num_dashas: int = 9
    ) -> List[Dict]:
        """
        Calculate sequence of Mahadashas
        
        Args:
            birth_dasha_lord: Starting Mahadasha lord
            start_date: Start date
            num_dashas: Number of dashas to calculate (default: all 9)
        
        Returns:
            List of Mahadasha periods
        """
        # Find starting index
        start_index = self.DASHA_LORDS.index(birth_dasha_lord)
        
        mahadashas = []
        current_date = start_date
        
        for i in range(num_dashas):
            # Get lord (cycle through the 9 lords)
            lord_index = (start_index + i) % 9
            lord = self.DASHA_LORDS[lord_index]
            
            # Calculate duration
            years = self.DASHA_YEARS[lord]
            days = int(years * 365.25)
            end_date = current_date + timedelta(days=days)
            
            mahadashas.append({
                'lord': lord,
                'start_date': current_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'duration_years': years,
            })
            
            current_date = end_date
        
        return mahadashas
    
    def calculate_antardasha(
        self,
        mahadasha_lord: str,
        mahadasha_start: datetime,
        mahadasha_end: datetime
    ) -> List[Dict]:
        """
        Calculate Antardasha (sub-periods) within a Mahadasha
        
        Args:
            mahadasha_lord: Mahadasha lord
            mahadasha_start: Mahadasha start date
            mahadasha_end: Mahadasha end date
        
        Returns:
            List of Antardasha periods
        """
        # Total duration of Mahadasha in days
        total_days = (mahadasha_end - mahadasha_start).days
        
        # Find starting index for Antardasha (starts with Mahadasha lord)
        start_index = self.DASHA_LORDS.index(mahadasha_lord)
        
        antardashas = []
        current_date = mahadasha_start
        
        # Total proportional years for all 9 antardashas
        mahadasha_years = self.DASHA_YEARS[mahadasha_lord]
        
        for i in range(9):
            # Get Antardasha lord (cycle through 9 lords)
            lord_index = (start_index + i) % 9
            antardasha_lord = self.DASHA_LORDS[lord_index]
            
            # Calculate proportional duration
            # Formula: (Mahadasha_years × Antardasha_years) / 120
            antardasha_years = self.DASHA_YEARS[antardasha_lord]
            proportional_years = (mahadasha_years * antardasha_years) / 120
            
            # Convert to days
            days = int(proportional_years * 365.25)
            end_date = current_date + timedelta(days=days)
            
            # Ensure we don't exceed Mahadasha end date
            if end_date > mahadasha_end:
                end_date = mahadasha_end
            
            antardashas.append({
                'mahadasha_lord': mahadasha_lord,
                'antardasha_lord': antardasha_lord,
                'start_date': current_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'duration_years': round(proportional_years, 2),
                'duration_months': round(proportional_years * 12, 1),
            })
            
            current_date = end_date
            
            if current_date >= mahadasha_end:
                break
        
        return antardashas
    
    def calculate_pratyantardasha(
        self,
        mahadasha_lord: str,
        antardasha_lord: str,
        antardasha_start: datetime,
        antardasha_end: datetime
    ) -> List[Dict]:
        """
        Calculate Pratyantardasha (sub-sub-periods) within an Antardasha
        
        Args:
            mahadasha_lord: Mahadasha lord
            antardasha_lord: Antardasha lord
            antardasha_start: Antardasha start date
            antardasha_end: Antardasha end date
        
        Returns:
            List of Pratyantardasha periods
        """
        # Find starting index (starts with Antardasha lord)
        start_index = self.DASHA_LORDS.index(antardasha_lord)
        
        pratyantardashas = []
        current_date = antardasha_start
        
        mahadasha_years = self.DASHA_YEARS[mahadasha_lord]
        antardasha_years = self.DASHA_YEARS[antardasha_lord]
        
        for i in range(9):
            lord_index = (start_index + i) % 9
            pratyantar_lord = self.DASHA_LORDS[lord_index]
            
            # Formula: (Maha × Antar × Pratyantar) / (120 × 120)
            pratyantar_years = self.DASHA_YEARS[pratyantar_lord]
            proportional_years = (mahadasha_years * antardasha_years * pratyantar_years) / (120 * 120)
            
            days = int(proportional_years * 365.25)
            end_date = current_date + timedelta(days=days)
            
            if end_date > antardasha_end:
                end_date = antardasha_end
            
            pratyantardashas.append({
                'mahadasha_lord': mahadasha_lord,
                'antardasha_lord': antardasha_lord,
                'pratyantardasha_lord': pratyantar_lord,
                'start_date': current_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'duration_days': (end_date - current_date).days,
            })
            
            current_date = end_date
            
            if current_date >= antardasha_end:
                break
        
        return pratyantardashas
    
    def get_current_dasha(
        self,
        moon_longitude: float,
        birth_date: datetime,
        current_date: datetime = None
    ) -> Dict:
        """
        Get current running Mahadasha, Antardasha, and Pratyantardasha
        
        Args:
            moon_longitude: Moon's longitude at birth
            birth_date: Birth datetime
            current_date: Date to check (default: today)
        
        Returns:
            Dictionary with current dasha details
        """
        if current_date is None:
            current_date = datetime.now()
        
        # Get birth dasha balance
        birth_lord, _, balance_end, _ = self.calculate_balance_dasha(moon_longitude, birth_date)
        
        # Calculate all Mahadashas
        mahadashas = self.calculate_mahadasha_sequence(birth_lord, birth_date, 9)
        
        # Find current Mahadasha
        current_mahadasha = None
        for maha in mahadashas:
            maha_start = datetime.strptime(maha['start_date'], '%Y-%m-%d')
            maha_end = datetime.strptime(maha['end_date'], '%Y-%m-%d')
            
            if maha_start <= current_date <= maha_end:
                current_mahadasha = maha
                
                # Calculate Antardashas for this Mahadasha
                antardashas = self.calculate_antardasha(
                    maha['lord'],
                    maha_start,
                    maha_end
                )
                
                # Find current Antardasha
                for antar in antardashas:
                    antar_start = datetime.strptime(antar['start_date'], '%Y-%m-%d')
                    antar_end = datetime.strptime(antar['end_date'], '%Y-%m-%d')
                    
                    if antar_start <= current_date <= antar_end:
                        current_antardasha = antar
                        
                        # Calculate Pratyantardashas
                        pratyantars = self.calculate_pratyantardasha(
                            maha['lord'],
                            antar['antardasha_lord'],
                            antar_start,
                            antar_end
                        )
                        
                        # Find current Pratyantardasha
                        current_pratyantar = None
                        for pratyantar in pratyantars:
                            prat_start = datetime.strptime(pratyantar['start_date'], '%Y-%m-%d')
                            prat_end = datetime.strptime(pratyantar['end_date'], '%Y-%m-%d')
                            
                            if prat_start <= current_date <= prat_end:
                                current_pratyantar = pratyantar
                                break
                        
                        return {
                            'mahadasha': current_mahadasha,
                            'antardasha': current_antardasha,
                            'pratyantardasha': current_pratyantar,
                            'current_date': current_date.strftime('%Y-%m-%d')
                        }
        
        return None
    
    def generate_complete_dasha_timeline(
        self,
        moon_longitude: float,
        birth_date: datetime,
        years_ahead: int = 30
    ) -> Dict:
        """
        Generate complete Dasha timeline for specified years
        
        Args:
            moon_longitude: Moon's longitude at birth
            birth_date: Birth datetime
            years_ahead: Number of years to generate (default: 30)
        
        Returns:
            Complete dasha timeline dictionary
        """
        # Get birth dasha
        birth_lord, _, balance_end, balance_years = self.calculate_balance_dasha(
            moon_longitude,
            birth_date
        )
        
        # Calculate all Mahadashas
        mahadashas = self.calculate_mahadasha_sequence(birth_lord, birth_date, 9)
        
        # Generate Antardashas for each Mahadasha
        detailed_timeline = []
        
        for maha in mahadashas:
            maha_start = datetime.strptime(maha['start_date'], '%Y-%m-%d')
            maha_end = datetime.strptime(maha['end_date'], '%Y-%m-%d')
            
            # Only include if within years_ahead
            if (maha_start - birth_date).days / 365.25 > years_ahead:
                break
            
            antardashas = self.calculate_antardasha(
                maha['lord'],
                maha_start,
                maha_end
            )
            
            detailed_timeline.append({
                'mahadasha': maha,
                'antardashas': antardashas
            })
        
        return {
            'birth_date': birth_date.strftime('%Y-%m-%d'),
            'birth_nakshatra': self.NAKSHATRA_NAMES[int(moon_longitude / (360/27))],
            'birth_dasha_lord': birth_lord,
            'balance_at_birth_years': round(balance_years, 2),
            'timeline': detailed_timeline
        }


# Example usage
if __name__ == "__main__":
    calculator = DashaCalculator()
    
    # Example: Moon at 32.8° (Taurus 2.8°, Rohini nakshatra)
    moon_longitude = 32.8
    birth_date = datetime(1990, 5, 15, 14, 30)
    
    # Get current dasha
    current = calculator.get_current_dasha(moon_longitude, birth_date)
    
    if current:
        print("Current Mahadasha:", current['mahadasha']['lord'])
        print("Current Antardasha:", current['antardasha']['antardasha_lord'])
        if current['pratyantardasha']:
            print("Current Pratyantardasha:", current['pratyantardasha']['pratyantardasha_lord'])