# astrology-engine/calculations/horoscope_generator.py
# Main Orchestrator - Routes to specific horoscope generators

from datetime import datetime
from typing import Dict, Optional, Literal
from .daily_horoscope import DailyHoroscopeGenerator
from .monthly_horoscope import MonthlyHoroscopeGenerator
from .yearly_horoscope import YearlyHoroscopeGenerator
from .lifetime_analysis import LifetimeAnalysisGenerator
from typing import List, Dict, Optional

class HoroscopeGenerator:
    """
    Main orchestrator for all horoscope generation.
    Routes requests to appropriate generator based on type.
    Handles common validation, error handling, and response formatting.
    """
    
    def __init__(self):
        """Initialize all generators"""
        self.daily_gen = DailyHoroscopeGenerator()
        self.monthly_gen = MonthlyHoroscopeGenerator()
        self.yearly_gen = YearlyHoroscopeGenerator()
        self.lifetime_gen = LifetimeAnalysisGenerator()
    
    def generate_horoscope(
        self,
        horoscope_type: Literal['daily', 'monthly', 'yearly', 'lifetime'],
        birth_date: str,
        birth_time: str,
        birth_location: str = None,
        latitude: float = None,
        longitude: float = None,
        timezone: str = None,
        target_date: str = None,
        target_month: int = None,
        target_year: int = None
    ) -> Dict:
        """
        Generate horoscope of specified type
        
        Args:
            horoscope_type: Type of horoscope ('daily', 'monthly', 'yearly', 'lifetime')
            birth_date: Birth date 'YYYY-MM-DD'
            birth_time: Birth time 'HH:MM:SS'
            birth_location: Location name (if lat/lon not provided)
            latitude: Birth latitude (optional)
            longitude: Birth longitude (optional)
            timezone: Timezone (optional)
            target_date: For daily horoscope 'YYYY-MM-DD'
            target_month: For monthly horoscope (1-12)
            target_year: For monthly/yearly horoscope
        
        Returns:
            Complete horoscope dict
        
        Raises:
            ValueError: If invalid parameters
            Exception: If generation fails
        """
        
        # Validate inputs
        self._validate_inputs(
            horoscope_type,
            birth_date,
            birth_time,
            birth_location,
            latitude,
            longitude
        )
        
        try:
            # Route to appropriate generator
            if horoscope_type == 'daily':
                result = self.daily_gen.generate_daily_horoscope(
                    birth_date=birth_date,
                    birth_time=birth_time,
                    birth_location=birth_location,
                    latitude=latitude,
                    longitude=longitude,
                    timezone=timezone,
                    target_date=target_date
                )
            
            elif horoscope_type == 'monthly':
                result = self.monthly_gen.generate_monthly_horoscope(
                    birth_date=birth_date,
                    birth_time=birth_time,
                    birth_location=birth_location,
                    latitude=latitude,
                    longitude=longitude,
                    timezone=timezone,
                    target_month=target_month,
                    target_year=target_year
                )
            
            elif horoscope_type == 'yearly':
                result = self.yearly_gen.generate_yearly_horoscope(
                    birth_date=birth_date,
                    birth_time=birth_time,
                    birth_location=birth_location,
                    latitude=latitude,
                    longitude=longitude,
                    timezone=timezone,
                    target_year=target_year
                )
            
            elif horoscope_type == 'lifetime':
                result = self.lifetime_gen.generate_lifetime_analysis(
                    birth_date=birth_date,
                    birth_time=birth_time,
                    birth_location=birth_location,
                    latitude=latitude,
                    longitude=longitude,
                    timezone=timezone
                )
            
            else:
                raise ValueError(f"Invalid horoscope_type: {horoscope_type}")
            
            # Add generation metadata
            result['generation_timestamp'] = datetime.now().isoformat()
            result['generator_version'] = '1.0.0'
            
            return result
            
        except Exception as e:
            raise Exception(f"Failed to generate {horoscope_type} horoscope: {str(e)}")
    
    def _validate_inputs(
        self,
        horoscope_type: str,
        birth_date: str,
        birth_time: str,
        birth_location: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float]
    ):
        """Validate common inputs"""
        
        # Validate horoscope type
        valid_types = ['daily', 'monthly', 'yearly', 'lifetime']
        if horoscope_type not in valid_types:
            raise ValueError(f"horoscope_type must be one of {valid_types}")
        
        # Validate birth_date format
        try:
            datetime.strptime(birth_date, '%Y-%m-%d')
        except ValueError:
            raise ValueError("birth_date must be in format 'YYYY-MM-DD'")
        
        # Validate birth_time format
        try:
            datetime.strptime(birth_time, '%H:%M:%S')
        except ValueError:
            raise ValueError("birth_time must be in format 'HH:MM:SS'")
        
        # Validate location data
        if latitude is None or longitude is None:
            if birth_location is None:
                raise ValueError("Either birth_location or latitude/longitude must be provided")
        
        # Validate latitude/longitude ranges
        if latitude is not None:
            if not -90 <= latitude <= 90:
                raise ValueError("latitude must be between -90 and 90")
        
        if longitude is not None:
            if not -180 <= longitude <= 180:
                raise ValueError("longitude must be between -180 and 180")
    
    def get_supported_types(self) -> List[str]:
        """Get list of supported horoscope types"""
        return ['daily', 'monthly', 'yearly', 'lifetime']
    
    def get_generator_info(self) -> Dict:
        """Get information about the generator"""
        return {
            'version': '1.0.0',
            'supported_types': self.get_supported_types(),
            'calculation_method': 'Swiss Ephemeris',
            'ayanamsa': 'Lahiri',
            'features': [
                'Geocoding support (city name to coordinates)',
                'Scientific planetary calculations',
                'Vedic astrology rules',
                'Dasha period calculations',
                'Transit analysis',
                'Yoga and Dosha detection'
            ]
        }


# Convenience functions for direct access
def generate_daily_horoscope(birth_date: str, birth_time: str, **kwargs) -> Dict:
    """Generate daily horoscope"""
    gen = HoroscopeGenerator()
    return gen.generate_horoscope('daily', birth_date, birth_time, **kwargs)

def generate_monthly_horoscope(birth_date: str, birth_time: str, **kwargs) -> Dict:
    """Generate monthly horoscope"""
    gen = HoroscopeGenerator()
    return gen.generate_horoscope('monthly', birth_date, birth_time, **kwargs)

def generate_yearly_horoscope(birth_date: str, birth_time: str, **kwargs) -> Dict:
    """Generate yearly horoscope"""
    gen = HoroscopeGenerator()
    return gen.generate_horoscope('yearly', birth_date, birth_time, **kwargs)

def generate_lifetime_analysis(birth_date: str, birth_time: str, **kwargs) -> Dict:
    """Generate lifetime analysis"""
    gen = HoroscopeGenerator()
    return gen.generate_horoscope('lifetime', birth_date, birth_time, **kwargs)


# Example usage and testing
if __name__ == "__main__":
    generator = HoroscopeGenerator()
    
    # Print generator info
    print("Generator Info:")
    info = generator.get_generator_info()
    print(f"Version: {info['version']}")
    print(f"Supported Types: {', '.join(info['supported_types'])}")
    print()
    
    # Test monthly horoscope generation
    print("Testing Monthly Horoscope Generation...")
    try:
        result = generator.generate_horoscope(
            horoscope_type='monthly',
            birth_date='1990-05-15',
            birth_time='14:30:00',
            birth_location='Mumbai, India',
            target_month=1,
            target_year=2025
        )
        
        print(f"✓ Generated: {result['title']}")
        print(f"✓ Career Score: {result['career_score']}/10")
        print(f"✓ Finance Score: {result['finance_score']}/10")
        print(f"✓ Overall Score: {result['overall_score']}/10")
        print()
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        print()
    
    # Test daily horoscope
    print("Testing Daily Horoscope Generation...")
    try:
        result = generate_daily_horoscope(
            birth_date='1990-05-15',
            birth_time='14:30:00',
            birth_location='Delhi, India',
            target_date='2025-01-15'
        )
        
        print(f"✓ Generated: {result['title']}")
        print(f"✓ Moon Sign: {result['moon_sign']}")
        print(f"✓ Moon Nakshatra: {result['moon_nakshatra']}")
        print()
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        print()
    
    # Test validation
    print("Testing Input Validation...")
    try:
        generator.generate_horoscope(
            horoscope_type='invalid_type',
            birth_date='1990-05-15',
            birth_time='14:30:00'
        )
    except ValueError as e:
        print(f"✓ Validation working: {str(e)}")
    
    print("\nAll tests completed!")