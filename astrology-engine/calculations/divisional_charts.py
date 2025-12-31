# astrology-engine/calculations/divisional_charts.py
# Shodashvarga Calculator - All 16 Divisional Charts

import swisseph as swe
from typing import Dict, List, Tuple
from datetime import datetime

class DivisionalChartsCalculator:
    """
    Calculate all 16 Shodashvarga (divisional charts) used in Vedic Astrology.
    Each divisional chart highlights specific areas of life.
    """
    
    SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    def __init__(self):
        """Initialize with Lahiri ayanamsa"""
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    def _normalize_sign(self, sign_num: int) -> int:
        """Normalize sign number to 1-12 range"""
        while sign_num > 12:
            sign_num -= 12
        while sign_num < 1:
            sign_num += 12
        return sign_num
    
    def calculate_d1_rasi(self, longitude: float) -> Dict:
        """
        D1 - Rasi Chart (Main Birth Chart)
        Standard zodiac sign based on 30-degree divisions
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        return {
            'chart': 'D1',
            'name': 'Rasi (Main Chart)',
            'sign_num': sign_num,
            'sign': self.SIGNS[sign_num - 1],
            'degree': degree_in_sign,
            'purpose': 'Overall life, personality, general indications'
        }
    
    def calculate_d2_hora(self, longitude: float) -> Dict:
        """
        D2 - Hora Chart
        Each sign divided into 2 parts of 15° each
        Odd signs: 0-15° = Leo, 15-30° = Cancer
        Even signs: 0-15° = Cancer, 15-30° = Leo
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        is_odd_sign = sign_num % 2 == 1
        
        if is_odd_sign:
            # Odd signs (Aries, Gemini, Leo, etc.)
            hora_sign = 5 if degree_in_sign < 15 else 4  # Leo or Cancer
        else:
            # Even signs (Taurus, Cancer, Virgo, etc.)
            hora_sign = 4 if degree_in_sign < 15 else 5  # Cancer or Leo
        
        return {
            'chart': 'D2',
            'name': 'Hora',
            'sign_num': hora_sign,
            'sign': self.SIGNS[hora_sign - 1],
            'purpose': 'Wealth, financial prosperity'
        }
    
    def calculate_d3_drekkana(self, longitude: float) -> Dict:
        """
        D3 - Drekkana Chart
        Each sign divided into 3 parts of 10° each
        Formula: Sign position + (decan - 1) * 4
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which decan (1, 2, or 3)
        decan = int(degree_in_sign / 10) + 1
        
        # Calculate D3 sign
        d3_sign = sign_num + (decan - 1) * 4
        d3_sign = self._normalize_sign(d3_sign)
        
        return {
            'chart': 'D3',
            'name': 'Drekkana',
            'sign_num': d3_sign,
            'sign': self.SIGNS[d3_sign - 1],
            'decan': decan,
            'purpose': 'Siblings, courage, co-borns'
        }
    
    def calculate_d4_chaturthamsa(self, longitude: float) -> Dict:
        """
        D4 - Chaturthamsa Chart
        Each sign divided into 4 parts of 7.5° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which quarter (1-4)
        quarter = int(degree_in_sign / 7.5) + 1
        if quarter > 4:
            quarter = 4
        
        # Calculate D4 sign
        d4_sign = sign_num + (quarter - 1) * 3
        d4_sign = self._normalize_sign(d4_sign)
        
        return {
            'chart': 'D4',
            'name': 'Chaturthamsa',
            'sign_num': d4_sign,
            'sign': self.SIGNS[d4_sign - 1],
            'quarter': quarter,
            'purpose': 'Property, real estate, fortune'
        }
    
    def calculate_d7_saptamsa(self, longitude: float) -> Dict:
        """
        D7 - Saptamsa Chart
        Each sign divided into 7 parts of ~4.286° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which seventh (1-7)
        seventh = int(degree_in_sign / (30/7)) + 1
        if seventh > 7:
            seventh = 7
        
        # For odd signs: start from same sign
        # For even signs: start from 7th sign
        if sign_num % 2 == 1:
            d7_sign = sign_num + (seventh - 1)
        else:
            d7_sign = sign_num + 6 + (seventh - 1)
        
        d7_sign = self._normalize_sign(d7_sign)
        
        return {
            'chart': 'D7',
            'name': 'Saptamsa',
            'sign_num': d7_sign,
            'sign': self.SIGNS[d7_sign - 1],
            'purpose': 'Children, progeny, grandchildren'
        }
    
    def calculate_d9_navamsa(self, longitude: float) -> Dict:
        """
        D9 - Navamsa Chart (Most Important Divisional Chart)
        Each sign divided into 9 parts of 3.333° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which navamsa (1-9)
        navamsa = int(degree_in_sign / (30/9)) + 1
        if navamsa > 9:
            navamsa = 9
        
        # Calculate based on sign element (Fire, Earth, Air, Water)
        element_group = (sign_num - 1) % 4
        
        if element_group == 0:  # Fire signs (Aries, Leo, Sagittarius)
            d9_sign = 1 + (navamsa - 1)
        elif element_group == 1:  # Earth signs (Taurus, Virgo, Capricorn)
            d9_sign = 10 + (navamsa - 1)
        elif element_group == 2:  # Air signs (Gemini, Libra, Aquarius)
            d9_sign = 7 + (navamsa - 1)
        else:  # Water signs (Cancer, Scorpio, Pisces)
            d9_sign = 4 + (navamsa - 1)
        
        d9_sign = self._normalize_sign(d9_sign)
        
        return {
            'chart': 'D9',
            'name': 'Navamsa',
            'sign_num': d9_sign,
            'sign': self.SIGNS[d9_sign - 1],
            'navamsa': navamsa,
            'purpose': 'Marriage, dharma, spiritual strength'
        }
    
    def calculate_d10_dasamsa(self, longitude: float) -> Dict:
        """
        D10 - Dasamsa Chart
        Each sign divided into 10 parts of 3° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which tenth (1-10)
        tenth = int(degree_in_sign / 3) + 1
        if tenth > 10:
            tenth = 10
        
        # For odd signs: start from same sign
        # For even signs: start from 9th sign
        if sign_num % 2 == 1:
            d10_sign = sign_num + (tenth - 1)
        else:
            d10_sign = sign_num + 8 + (tenth - 1)
        
        d10_sign = self._normalize_sign(d10_sign)
        
        return {
            'chart': 'D10',
            'name': 'Dasamsa',
            'sign_num': d10_sign,
            'sign': self.SIGNS[d10_sign - 1],
            'purpose': 'Career, profession, achievements'
        }
    
    def calculate_d12_dwadasamsa(self, longitude: float) -> Dict:
        """
        D12 - Dwadasamsa Chart
        Each sign divided into 12 parts of 2.5° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which twelfth (1-12)
        twelfth = int(degree_in_sign / 2.5) + 1
        if twelfth > 12:
            twelfth = 12
        
        # Start from same sign
        d12_sign = sign_num + (twelfth - 1)
        d12_sign = self._normalize_sign(d12_sign)
        
        return {
            'chart': 'D12',
            'name': 'Dwadasamsa',
            'sign_num': d12_sign,
            'sign': self.SIGNS[d12_sign - 1],
            'purpose': 'Parents, ancestors, lineage'
        }
    
    def calculate_d16_shodasamsa(self, longitude: float) -> Dict:
        """
        D16 - Shodasamsa Chart
        Each sign divided into 16 parts of 1.875° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which sixteenth (1-16)
        sixteenth = int(degree_in_sign / 1.875) + 1
        if sixteenth > 16:
            sixteenth = 16
        
        # For movable signs: start from Aries
        # For fixed signs: start from Leo
        # For dual signs: start from Sagittarius
        movable_signs = [1, 4, 7, 10]  # Aries, Cancer, Libra, Capricorn
        fixed_signs = [2, 5, 8, 11]     # Taurus, Leo, Scorpio, Aquarius
        
        if sign_num in movable_signs:
            d16_sign = 1 + (sixteenth - 1)  # Start from Aries
        elif sign_num in fixed_signs:
            d16_sign = 5 + (sixteenth - 1)  # Start from Leo
        else:
            d16_sign = 9 + (sixteenth - 1)  # Start from Sagittarius
        
        d16_sign = self._normalize_sign(d16_sign)
        
        return {
            'chart': 'D16',
            'name': 'Shodasamsa',
            'sign_num': d16_sign,
            'sign': self.SIGNS[d16_sign - 1],
            'purpose': 'Vehicles, comforts, happiness'
        }
    
    def calculate_d20_vimsamsa(self, longitude: float) -> Dict:
        """
        D20 - Vimsamsa Chart
        Each sign divided into 20 parts of 1.5° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which twentieth (1-20)
        twentieth = int(degree_in_sign / 1.5) + 1
        if twentieth > 20:
            twentieth = 20
        
        # For movable signs: start from Aries
        # For fixed signs: start from Sagittarius
        # For dual signs: start from Leo
        movable_signs = [1, 4, 7, 10]
        fixed_signs = [2, 5, 8, 11]
        
        if sign_num in movable_signs:
            d20_sign = 1 + (twentieth - 1)
        elif sign_num in fixed_signs:
            d20_sign = 9 + (twentieth - 1)
        else:
            d20_sign = 5 + (twentieth - 1)
        
        d20_sign = self._normalize_sign(d20_sign)
        
        return {
            'chart': 'D20',
            'name': 'Vimsamsa',
            'sign_num': d20_sign,
            'sign': self.SIGNS[d20_sign - 1],
            'purpose': 'Spiritual practices, worship, devotion'
        }
    
    def calculate_d24_chaturvimsamsa(self, longitude: float) -> Dict:
        """
        D24 - Chaturvimsamsa Chart
        Each sign divided into 24 parts of 1.25° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which twenty-fourth (1-24)
        twentyfourth = int(degree_in_sign / 1.25) + 1
        if twentyfourth > 24:
            twentyfourth = 24
        
        # For odd signs: start from Leo
        # For even signs: start from Cancer
        if sign_num % 2 == 1:
            d24_sign = 5 + (twentyfourth - 1)  # Start from Leo
        else:
            d24_sign = 4 + (twentyfourth - 1)  # Start from Cancer
        
        d24_sign = self._normalize_sign(d24_sign)
        
        return {
            'chart': 'D24',
            'name': 'Chaturvimsamsa',
            'sign_num': d24_sign,
            'sign': self.SIGNS[d24_sign - 1],
            'purpose': 'Education, learning, knowledge'
        }
    
    def calculate_d27_nakshatramsa(self, longitude: float) -> Dict:
        """
        D27 - Nakshatramsa Chart
        Each sign divided into 27 parts of ~1.111° each
        Pada-based division
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which pada (1-27 is not used, use 1-4 per nakshatra)
        # Simplified: divide into 27 parts
        part = int(degree_in_sign / (30/27)) + 1
        if part > 27:
            part = 27
        
        # Calculate based on fire signs
        if sign_num in [1, 5, 9]:  # Fire signs
            d27_sign = 1 + (part - 1)
        elif sign_num in [2, 6, 10]:  # Earth signs
            d27_sign = 4 + (part - 1)
        elif sign_num in [3, 7, 11]:  # Air signs
            d27_sign = 7 + (part - 1)
        else:  # Water signs
            d27_sign = 10 + (part - 1)
        
        d27_sign = self._normalize_sign(d27_sign)
        
        return {
            'chart': 'D27',
            'name': 'Nakshatramsa',
            'sign_num': d27_sign,
            'sign': self.SIGNS[d27_sign - 1],
            'purpose': 'Strengths, weaknesses, overall nature'
        }
    
    def calculate_d30_trimsamsa(self, longitude: float) -> Dict:
        """
        D30 - Trimsamsa Chart
        Each sign divided into 30 parts of 1° each
        Special division for malefic influences
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        degree_int = int(degree_in_sign)
        
        # Complex division based on odd/even signs
        if sign_num % 2 == 1:  # Odd signs
            if degree_int < 5:
                d30_sign = sign_num  # Mars
            elif degree_int < 10:
                d30_sign = sign_num + 10  # Saturn
            elif degree_int < 18:
                d30_sign = sign_num + 8  # Jupiter
            elif degree_int < 25:
                d30_sign = sign_num + 6  # Mercury
            else:
                d30_sign = sign_num + 4  # Venus
        else:  # Even signs
            if degree_int < 5:
                d30_sign = sign_num + 4  # Venus
            elif degree_int < 12:
                d30_sign = sign_num + 6  # Mercury
            elif degree_int < 20:
                d30_sign = sign_num + 8  # Jupiter
            elif degree_int < 25:
                d30_sign = sign_num + 10  # Saturn
            else:
                d30_sign = sign_num  # Mars
        
        d30_sign = self._normalize_sign(d30_sign)
        
        return {
            'chart': 'D30',
            'name': 'Trimsamsa',
            'sign_num': d30_sign,
            'sign': self.SIGNS[d30_sign - 1],
            'purpose': 'Evils, misfortunes, sub-conscious'
        }
    
    def calculate_d40_khavedamsa(self, longitude: float) -> Dict:
        """
        D40 - Khavedamsa Chart
        Each sign divided into 40 parts of 0.75° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which fortieth (1-40)
        fortieth = int(degree_in_sign / 0.75) + 1
        if fortieth > 40:
            fortieth = 40
        
        # For movable signs: start from Aries
        # For fixed signs: start from Leo
        # For dual signs: start from Sagittarius
        movable_signs = [1, 4, 7, 10]
        fixed_signs = [2, 5, 8, 11]
        
        if sign_num in movable_signs:
            d40_sign = 1 + (fortieth - 1)
        elif sign_num in fixed_signs:
            d40_sign = 5 + (fortieth - 1)
        else:
            d40_sign = 9 + (fortieth - 1)
        
        d40_sign = self._normalize_sign(d40_sign)
        
        return {
            'chart': 'D40',
            'name': 'Khavedamsa',
            'sign_num': d40_sign,
            'sign': self.SIGNS[d40_sign - 1],
            'purpose': 'Auspicious/inauspicious effects'
        }
    
    def calculate_d45_akshavedamsa(self, longitude: float) -> Dict:
        """
        D45 - Akshavedamsa Chart
        Each sign divided into 45 parts of 0.666° each
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which part (1-45)
        part = int(degree_in_sign / (30/45)) + 1
        if part > 45:
            part = 45
        
        # Simplified calculation
        d45_sign = sign_num + (part - 1)
        d45_sign = self._normalize_sign(d45_sign)
        
        return {
            'chart': 'D45',
            'name': 'Akshavedamsa',
            'sign_num': d45_sign,
            'sign': self.SIGNS[d45_sign - 1],
            'purpose': 'General character, behavior'
        }
    
    def calculate_d60_shashtiamsa(self, longitude: float) -> Dict:
        """
        D60 - Shashtiamsa Chart (Most Detailed Chart)
        Each sign divided into 60 parts of 0.5° each
        Reveals karma from past lives
        """
        sign_num = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        
        # Determine which sixtieth (1-60)
        sixtieth = int(degree_in_sign / 0.5) + 1
        if sixtieth > 60:
            sixtieth = 60
        
        # Start from same sign
        d60_sign = sign_num + (sixtieth - 1)
        d60_sign = self._normalize_sign(d60_sign)
        
        return {
            'chart': 'D60',
            'name': 'Shashtiamsa',
            'sign_num': d60_sign,
            'sign': self.SIGNS[d60_sign - 1],
            'sixtieth': sixtieth,
            'purpose': 'Past life karma, complete destiny'
        }
    
    def calculate_all_divisional_charts(self, longitude: float) -> Dict:
        """
        Calculate all 16 divisional charts for a given planetary longitude
        
        Args:
            longitude: Sidereal longitude of planet (0-360°)
        
        Returns:
            Dictionary with all 16 divisional chart positions
        """
        return {
            'D1': self.calculate_d1_rasi(longitude),
            'D2': self.calculate_d2_hora(longitude),
            'D3': self.calculate_d3_drekkana(longitude),
            'D4': self.calculate_d4_chaturthamsa(longitude),
            'D7': self.calculate_d7_saptamsa(longitude),
            'D9': self.calculate_d9_navamsa(longitude),
            'D10': self.calculate_d10_dasamsa(longitude),
            'D12': self.calculate_d12_dwadasamsa(longitude),
            'D16': self.calculate_d16_shodasamsa(longitude),
            'D20': self.calculate_d20_vimsamsa(longitude),
            'D24': self.calculate_d24_chaturvimsamsa(longitude),
            'D27': self.calculate_d27_nakshatramsa(longitude),
            'D30': self.calculate_d30_trimsamsa(longitude),
            'D40': self.calculate_d40_khavedamsa(longitude),
            'D45': self.calculate_d45_akshavedamsa(longitude),
            'D60': self.calculate_d60_shashtiamsa(longitude),
        }


# Test function
def test_divisional_charts():
    calculator = DivisionalChartsCalculator()
    sun_longitude = 30.55
    charts = calculator.calculate_all_divisional_charts(sun_longitude)
    for chart_name, chart_data in charts.items():
        print(f"{chart_data['name']:20s} ({chart_name}): {chart_data['sign']:12s}")
    return charts

if __name__ == "__main__":
    test_divisional_charts()