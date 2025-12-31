# astrology-engine/api/models.py
# Pydantic Models for API Request/Response Validation (UPDATED)

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from enum import Enum

# ==========================================
# ENUMS
# ==========================================

class AyanamsaType(str, Enum):
    """Ayanamsa (precession) systems"""
    LAHIRI = "Lahiri"
    RAMAN = "Raman"
    KP = "KP"
    FAGAN = "Fagan"

class HouseSystem(str, Enum):
    """House calculation systems"""
    PLACIDUS = "P"
    KOCH = "K"
    EQUAL = "E"
    WHOLE_SIGN = "W"

class HoroscopeType(str, Enum):
    """Types of horoscope predictions"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    LIFETIME = "lifetime"

class BudgetLevel(str, Enum):
    """Budget levels for remedies"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

# ==========================================
# REQUEST MODELS (EXISTING - KEEP)
# ==========================================

class BirthDetailsRequest(BaseModel):
    """Request model for birth details"""
    birth_date: str = Field(..., description="Birth date in YYYY-MM-DD format", example="1990-05-15")
    birth_time: str = Field(..., description="Birth time in HH:MM format", example="14:30")
    latitude: float = Field(..., ge=-90, le=90, description="Birth place latitude", example=28.6139)
    longitude: float = Field(..., ge=-180, le=180, description="Birth place longitude", example=77.2090)
    timezone: float = Field(..., ge=-12, le=14, description="Timezone offset in hours", example=5.5)
    location_name: Optional[str] = Field(None, description="Birth place name", example="New Delhi, India")
    ayanamsa: Optional[AyanamsaType] = Field(AyanamsaType.LAHIRI, description="Ayanamsa system")
    house_system: Optional[HouseSystem] = Field(HouseSystem.PLACIDUS, description="House calculation system")
    
    @validator('birth_date')
    def validate_birth_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Invalid date format. Use YYYY-MM-DD')
    
    @validator('birth_time')
    def validate_birth_time(cls, v):
        try:
            datetime.strptime(v, '%H:%M')
            return v
        except ValueError:
            raise ValueError('Invalid time format. Use HH:MM')

class DashaRequest(BaseModel):
    """Request model for Dasha calculation"""
    moon_longitude: float = Field(..., ge=0, lt=360, description="Moon's sidereal longitude", example=32.8)
    birth_date: str = Field(..., description="Birth date in YYYY-MM-DD format")
    birth_time: str = Field(..., description="Birth time in HH:MM format")
    years_ahead: Optional[int] = Field(30, ge=1, le=120, description="Years to calculate ahead")
    
    @validator('birth_date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Invalid date format. Use YYYY-MM-DD')

class CurrentDashaRequest(BaseModel):
    """Request model for current Dasha query"""
    moon_longitude: float = Field(..., ge=0, lt=360, description="Moon's sidereal longitude")
    birth_date: str = Field(..., description="Birth date in YYYY-MM-DD format")
    birth_time: str = Field(..., description="Birth time in HH:MM format")
    current_date: Optional[str] = Field(None, description="Date to check (default: today)")

class TransitRequest(BaseModel):
    """Request model for transit calculation"""
    natal_moon_sign: int = Field(..., ge=1, le=12, description="Natal Moon sign (1-12)", example=2)
    natal_planets: Dict[str, Dict] = Field(..., description="Natal planet positions")
    current_date: Optional[str] = Field(None, description="Date to check (default: today)")

class HoroscopeRequest(BaseModel):
    """Request model for horoscope generation"""
    birth_details: BirthDetailsRequest
    horoscope_type: HoroscopeType
    category: Optional[str] = Field(None, description="Specific category (career, finance, etc.)")

# ==========================================
# NEW REQUEST MODELS FOR HOROSCOPE
# ==========================================

class DailyHoroscopeRequest(BaseModel):
    """Request model for daily horoscope"""
    birth_date: str = Field(..., description="Birth date YYYY-MM-DD")
    birth_time: str = Field(..., description="Birth time HH:MM:SS")
    birth_location: Optional[str] = Field(None, description="Birth location name")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    timezone: Optional[str] = Field(None, description="Timezone string")
    target_date: Optional[str] = Field(None, description="Target date YYYY-MM-DD")

class MonthlyHoroscopeRequest(BaseModel):
    """Request model for monthly horoscope"""
    birth_date: str = Field(..., description="Birth date YYYY-MM-DD")
    birth_time: str = Field(..., description="Birth time HH:MM:SS")
    birth_location: Optional[str] = Field(None, description="Birth location name")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    timezone: Optional[str] = Field(None)
    target_month: Optional[int] = Field(None, ge=1, le=12)
    target_year: Optional[int] = Field(None, ge=1900, le=2100)

class YearlyHoroscopeRequest(BaseModel):
    """Request model for yearly horoscope"""
    birth_date: str = Field(..., description="Birth date YYYY-MM-DD")
    birth_time: str = Field(..., description="Birth time HH:MM:SS")
    birth_location: Optional[str] = Field(None, description="Birth location name")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    timezone: Optional[str] = Field(None)
    target_year: Optional[int] = Field(None, ge=1900, le=2100)

class LifetimeAnalysisRequest(BaseModel):
    """Request model for lifetime analysis"""
    birth_date: str = Field(..., description="Birth date YYYY-MM-DD")
    birth_time: str = Field(..., description="Birth time HH:MM:SS")
    birth_location: Optional[str] = Field(None, description="Birth location name")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    timezone: Optional[str] = Field(None)

# ==========================================
# NEW REQUEST MODELS FOR REMEDIES
# ==========================================

class RemedyRequest(BaseModel):
    """Base request model for remedies"""
    birth_date: str = Field(..., description="Birth date YYYY-MM-DD")
    birth_time: str = Field(..., description="Birth time HH:MM:SS")
    birth_location: Optional[str] = Field(None, description="Birth location name")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    timezone: Optional[str] = Field(None)
    current_issues: Optional[List[str]] = Field(None, description="List of current issues")

class CompleteRemedyRequest(RemedyRequest):
    """Request model for complete remedy package"""
    budget: BudgetLevel = Field(BudgetLevel.MEDIUM, description="Budget level for gemstones")

class GemstoneRequest(RemedyRequest):
    """Request model for gemstone recommendations"""
    pass

class MantraRequest(RemedyRequest):
    """Request model for mantra recommendations"""
    specific_issues: Optional[List[str]] = Field(None, description="Specific issues to address")

# ==========================================
# RESPONSE MODELS (EXISTING - KEEP)
# ==========================================

class PlanetPosition(BaseModel):
    """Planet position details"""
    longitude: float = Field(..., description="Sidereal longitude")
    sign: str = Field(..., description="Zodiac sign")
    sign_num: int = Field(..., ge=1, le=12, description="Sign number (1-12)")
    degree: float = Field(..., description="Degree within sign")
    speed: Optional[float] = Field(None, description="Daily motion")
    is_retrograde: bool = Field(False, description="Retrograde status")
    formatted: str = Field(..., description="Formatted position string")

class NakshatraInfo(BaseModel):
    """Nakshatra details"""
    nakshatra: str = Field(..., description="Nakshatra name")
    nakshatra_num: int = Field(..., ge=1, le=27, description="Nakshatra number")
    pada: int = Field(..., ge=1, le=4, description="Pada (quarter)")
    formatted: str = Field(..., description="Formatted nakshatra string")

class AscendantInfo(BaseModel):
    """Ascendant details"""
    longitude: float
    sign: str
    sign_num: int
    degree: float
    formatted: str

class HouseInfo(BaseModel):
    """House cusp details"""
    house_num: int
    cusp_longitude: float
    sign: str
    sign_num: int
    degree: float
    lord: str
    formatted: str

class RasiChart(BaseModel):
    """Rasi chart structure"""
    houses: Dict[int, List[Dict]] = Field(..., description="Planets in each house (1-12)")

class KundliResponse(BaseModel):
    """Complete Kundli response"""
    success: bool = True
    data: Dict[str, Any] = Field(..., description="Kundli data")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class DashaResponse(BaseModel):
    """Dasha calculation response"""
    success: bool = True
    data: Dict[str, Any] = Field(..., description="Dasha timeline data")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class TransitResponse(BaseModel):
    """Transit analysis response"""
    success: bool = True
    data: Dict[str, Any] = Field(..., description="Transit data")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class PlanetaryStrengthResponse(BaseModel):
    """Planetary strength analysis response"""
    success: bool = True
    data: Dict[str, Any] = Field(..., description="Strength analysis data")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class HouseAnalysisResponse(BaseModel):
    """House analysis response"""
    success: bool = True
    data: Dict[str, Any] = Field(..., description="House analysis data")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    error: Dict[str, Any] = Field(..., description="Error details")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# ==========================================
# NEW RESPONSE MODELS FOR HOROSCOPE
# ==========================================

class HoroscopeResponse(BaseModel):
    """Generic horoscope response"""
    success: bool = True
    data: Dict[str, Any] = Field(..., description="Horoscope data")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "horoscope_type": "monthly",
                    "title": "Monthly Horoscope - January 2025",
                    "career_prediction": "Good month for career...",
                    "career_score": 8,
                    "overall_score": 7
                },
                "timestamp": "2025-01-15T10:30:00"
            }
        }

class DailyHoroscopeResponse(HoroscopeResponse):
    """Daily horoscope response"""
    pass

class MonthlyHoroscopeResponse(HoroscopeResponse):
    """Monthly horoscope response"""
    pass

class YearlyHoroscopeResponse(HoroscopeResponse):
    """Yearly horoscope response"""
    pass

class LifetimeAnalysisResponse(HoroscopeResponse):
    """Lifetime analysis response"""
    pass

# ==========================================
# NEW RESPONSE MODELS FOR REMEDIES
# ==========================================

class RemedyResponse(BaseModel):
    """Generic remedy response"""
    success: bool = True
    data: Dict[str, Any] = Field(..., description="Remedy data")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "recommendations": [],
                    "wearing_guidelines": [],
                    "precautions": []
                },
                "timestamp": "2025-01-15T10:30:00"
            }
        }

class GemstoneResponse(RemedyResponse):
    """Gemstone recommendations response"""
    pass

class MantraResponse(RemedyResponse):
    """Mantra recommendations response"""
    pass

class CompleteRemedyResponse(RemedyResponse):
    """Complete remedy package response"""
    pass

# ==========================================
# ADDITIONAL MODELS (KEEP EXISTING)
# ==========================================

class SadeSatiInfo(BaseModel):
    """Sade Sati information"""
    in_sade_sati: bool
    phase: Optional[int] = Field(None, ge=1, le=3)
    phase_description: Optional[str] = None
    saturn_sign: str
    moon_sign: str
    duration: str
    effects: Optional[Dict] = None

class JupiterTransitInfo(BaseModel):
    """Jupiter transit information"""
    jupiter_sign: str
    moon_sign: str
    house_from_moon: int
    is_beneficial: bool
    effects: str
    duration: str

class YogaInfo(BaseModel):
    """Yoga (astrological combination) details"""
    name: str = Field(..., description="Yoga name")
    description: str = Field(..., description="Yoga description")
    strength: str = Field(..., description="Yoga strength level")
    effect: str = Field(..., description="Expected effects")

class DignityInfo(BaseModel):
    """Planet dignity information"""
    status: str = Field(..., description="Dignity status")
    strength_percentage: float = Field(..., ge=0, le=100)
    description: str = Field(..., description="Dignity description")

class AspectInfo(BaseModel):
    """Planetary aspect information"""
    planet1: str
    planet2: str
    aspect_type: str
    angle: float
    strength: float
    is_beneficial: bool

# ==========================================
# BATCH REQUEST MODELS
# ==========================================

class BatchBirthDetailsRequest(BaseModel):
    """Request for batch Kundli generation"""
    births: List[BirthDetailsRequest] = Field(..., max_items=10, description="Maximum 10 births per request")

class CompatibilityRequest(BaseModel):
    """Request for compatibility analysis"""
    person1_birth: BirthDetailsRequest
    person2_birth: BirthDetailsRequest
    analysis_type: Optional[str] = Field("comprehensive", description="Type of compatibility analysis")

# ==========================================
# PAGINATION MODELS
# ==========================================

class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(10, ge=1, le=100, description="Items per page")

class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    success: bool = True
    data: List[Any]
    pagination: Dict[str, Any] = Field(..., description="Pagination metadata")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# ==========================================
# HEALTH CHECK MODELS
# ==========================================

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    timestamp: str
    components: Dict[str, str] = Field(..., description="Component statuses")

# ==========================================
# HELPER FUNCTIONS
# ==========================================

def create_success_response(data: Any) -> Dict:
    """Create standardized success response"""
    return {
        "success": True,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }

def create_error_response(message: str, detail: str = None) -> Dict:
    """Create standardized error response"""
    return {
        "success": False,
        "error": {
            "message": message,
            "detail": detail
        },
        "timestamp": datetime.now().isoformat()
    }