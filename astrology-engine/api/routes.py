# astrology-engine/api/routes.py
# API Routes - All Endpoints for Astrology Calculations (UPDATED)

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# OLD calculators (keep for backward compatibility)
from calculations.kundli_calculator import KundliCalculator
from calculations.planetary_positions import PlanetaryPositions
from calculations.dasha_calculator import DashaCalculator
from calculations.house_system import HouseSystem
from calculations.transit_calculator import TransitCalculator

# NEW generators (add these)
from horoscopes.horoscope_generator import HoroscopeGenerator
from remedies.remedy_engine import RemedyEngine
from remedies.gemstone_suggestions import GemstoneSuggestions
from remedies.mantra_suggestions import MantraSuggestions

from .models import (
    BirthDetailsRequest,
    DashaRequest,
    CurrentDashaRequest,
    TransitRequest,
    KundliResponse,
    DashaResponse,
    TransitResponse,
    PlanetaryStrengthResponse,
    HouseAnalysisResponse,
    ErrorResponse,
    create_success_response,
    create_error_response
)

# Initialize router
router = APIRouter()

# Initialize OLD calculators
kundli_calc = KundliCalculator()
planet_calc = PlanetaryPositions()
dasha_calc = DashaCalculator()
house_calc = HouseSystem()
transit_calc = TransitCalculator()

# Add this to astrology-engine/api/routes.py
# Insert after line 49 (after transit_calc initialization)

# NEW: Comprehensive Kundli Generator
from calculations.comprehensive_kundli import ComprehensiveKundliGenerator
comprehensive_gen = ComprehensiveKundliGenerator()

# NEW ENDPOINT: Comprehensive Kundli
@router.post(
    "/kundli/comprehensive",
    tags=["Kundli"],
    summary="Generate Comprehensive Kundli",
    description="Complete kundli with divisional charts, house analysis, and dasha"
)
async def generate_comprehensive_kundli(
    birth_date: str = Query(..., description="Birth date YYYY-MM-DD"),
    birth_time: str = Query(..., description="Birth time HH:MM"),
    latitude: float = Query(..., description="Birth latitude"),
    longitude: float = Query(..., description="Birth longitude"),
    timezone: float = Query(5.5, description="Timezone offset"),
    name: Optional[str] = Query(None, description="Person's name"),
    place: Optional[str] = Query(None, description="Birth place")
):
    """Generate comprehensive kundli with all features"""
    try:
        result = comprehensive_gen.generate_comprehensive_kundli(
            birth_date=birth_date,
            birth_time=birth_time,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            name=name,
            place=place
        )
        return create_success_response(result)
    except Exception as e:
        import traceback
        print("="*50)
        traceback.print_exc()
        print("="*50)
        raise HTTPException(status_code=500, detail=str(e))
    
    
# Initialize NEW generators
horoscope_gen = HoroscopeGenerator()
remedy_engine = RemedyEngine()
gemstone_gen = GemstoneSuggestions()
mantra_gen = MantraSuggestions()

# ==========================================
# HOROSCOPE ENDPOINTS (NEW)
# ==========================================

@router.post(
    "/horoscope/daily",
    tags=["Horoscope"],
    summary="Generate Daily Horoscope",
    description="Generate complete daily horoscope with predictions"
)
async def generate_daily_horoscope(
    birth_date: str = Query(..., description="Birth date YYYY-MM-DD"),
    birth_time: str = Query(..., description="Birth time HH:MM:SS"),
    birth_location: Optional[str] = Query(None, description="Birth location name"),
    latitude: Optional[float] = Query(None, description="Birth latitude"),
    longitude: Optional[float] = Query(None, description="Birth longitude"),
    timezone: Optional[str] = Query(None, description="Timezone"),
    target_date: Optional[str] = Query(None, description="Target date YYYY-MM-DD")
):
    """Generate daily horoscope"""
    try:
        result = horoscope_gen.generate_horoscope(
            horoscope_type='daily',
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            target_date=target_date
        )
        return create_success_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/horoscope/monthly",
    tags=["Horoscope"],
    summary="Generate Monthly Horoscope",
    description="Generate complete monthly horoscope with predictions"
)
async def generate_monthly_horoscope(
    birth_date: str = Query(..., description="Birth date YYYY-MM-DD"),
    birth_time: str = Query(..., description="Birth time HH:MM:SS"),
    birth_location: Optional[str] = Query(None, description="Birth location name"),
    latitude: Optional[float] = Query(None, description="Birth latitude"),
    longitude: Optional[float] = Query(None, description="Birth longitude"),
    timezone: Optional[str] = Query(None, description="Timezone"),
    target_month: Optional[int] = Query(None, ge=1, le=12, description="Target month 1-12"),
    target_year: Optional[int] = Query(None, description="Target year")
):
    """Generate monthly horoscope"""
    try:
        result = horoscope_gen.generate_horoscope(
            horoscope_type='monthly',
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            target_month=target_month,
            target_year=target_year
        )
        return create_success_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/horoscope/yearly",
    tags=["Horoscope"],
    summary="Generate Yearly Horoscope",
    description="Generate complete yearly horoscope with quarterly breakdown"
)
async def generate_yearly_horoscope(
    birth_date: str = Query(..., description="Birth date YYYY-MM-DD"),
    birth_time: str = Query(..., description="Birth time HH:MM:SS"),
    birth_location: Optional[str] = Query(None, description="Birth location name"),
    latitude: Optional[float] = Query(None, description="Birth latitude"),
    longitude: Optional[float] = Query(None, description="Birth longitude"),
    timezone: Optional[str] = Query(None, description="Timezone"),
    target_year: Optional[int] = Query(None, description="Target year")
):
    """Generate yearly horoscope"""
    try:
        result = horoscope_gen.generate_horoscope(
            horoscope_type='yearly',
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            target_year=target_year
        )
        return create_success_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/horoscope/lifetime",
    tags=["Horoscope"],
    summary="Generate Lifetime Analysis",
    description="Generate complete lifetime analysis covering all life areas"
)
async def generate_lifetime_analysis(
    birth_date: str = Query(..., description="Birth date YYYY-MM-DD"),
    birth_time: str = Query(..., description="Birth time HH:MM:SS"),
    birth_location: Optional[str] = Query(None, description="Birth location name"),
    latitude: Optional[float] = Query(None, description="Birth latitude"),
    longitude: Optional[float] = Query(None, description="Birth longitude"),
    timezone: Optional[str] = Query(None, description="Timezone")
):
    """Generate lifetime analysis"""
    try:
        result = horoscope_gen.generate_horoscope(
            horoscope_type='lifetime',
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone
        )
        return create_success_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# REMEDY ENDPOINTS (NEW)
# ==========================================

@router.post(
    "/remedies/complete",
    tags=["Remedies"],
    summary="Generate Complete Remedy Package",
    description="Generate comprehensive remedies including gemstones, mantras, and lifestyle"
)
async def generate_complete_remedies(
    birth_date: str = Query(..., description="Birth date YYYY-MM-DD"),
    birth_time: str = Query(..., description="Birth time HH:MM:SS"),
    birth_location: Optional[str] = Query(None, description="Birth location name"),
    latitude: Optional[float] = Query(None, description="Birth latitude"),
    longitude: Optional[float] = Query(None, description="Birth longitude"),
    timezone: Optional[str] = Query(None, description="Timezone"),
    current_issues: Optional[str] = Query(None, description="Comma-separated issues (career,health,etc)"),
    budget: str = Query('medium', description="Budget level: low, medium, high")
):
    """Generate complete remedy package"""
    try:
        issues_list = current_issues.split(',') if current_issues else None
        
        result = remedy_engine.generate_complete_remedies(
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            current_issues=issues_list,
            budget=budget
        )
        return create_success_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/remedies/gemstones",
    tags=["Remedies"],
    summary="Get Gemstone Recommendations",
    description="Generate personalized gemstone recommendations"
)
async def get_gemstone_recommendations(
    birth_date: str = Query(..., description="Birth date YYYY-MM-DD"),
    birth_time: str = Query(..., description="Birth time HH:MM:SS"),
    birth_location: Optional[str] = Query(None, description="Birth location name"),
    latitude: Optional[float] = Query(None, description="Birth latitude"),
    longitude: Optional[float] = Query(None, description="Birth longitude"),
    timezone: Optional[str] = Query(None, description="Timezone"),
    current_issues: Optional[str] = Query(None, description="Comma-separated issues")
):
    """Get gemstone recommendations"""
    try:
        issues_list = current_issues.split(',') if current_issues else None
        
        result = gemstone_gen.suggest_gemstones(
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            current_issues=issues_list
        )
        return create_success_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/remedies/mantras",
    tags=["Remedies"],
    summary="Get Mantra Recommendations",
    description="Generate personalized mantra recommendations"
)
async def get_mantra_recommendations(
    birth_date: str = Query(..., description="Birth date YYYY-MM-DD"),
    birth_time: str = Query(..., description="Birth time HH:MM:SS"),
    birth_location: Optional[str] = Query(None, description="Birth location name"),
    latitude: Optional[float] = Query(None, description="Birth latitude"),
    longitude: Optional[float] = Query(None, description="Birth longitude"),
    timezone: Optional[str] = Query(None, description="Timezone"),
    specific_issues: Optional[str] = Query(None, description="Comma-separated issues")
):
    """Get mantra recommendations"""
    try:
        issues_list = specific_issues.split(',') if specific_issues else None
        
        result = mantra_gen.suggest_mantras(
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            specific_issues=issues_list
        )
        return create_success_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# KUNDLI ENDPOINTS (EXISTING - KEEP AS IS)
# ==========================================

@router.post(
    "/kundli/generate",
    response_model=KundliResponse,
    tags=["Kundli"],
    summary="Generate Complete Kundli",
    description="Generate complete birth chart with planets, houses, and divisional charts"
)
async def generate_kundli(request: BirthDetailsRequest):
    """Generate complete Kundli (birth chart)"""
    try:
        birth_datetime = datetime.strptime(
            f"{request.birth_date} {request.birth_time}",
            "%Y-%m-%d %H:%M"
        )
        
        kundli_calc._set_ayanamsa(request.ayanamsa.value)
        
        kundli = kundli_calc.generate_kundli(
            birth_date=birth_datetime,
            latitude=request.latitude,
            longitude=request.longitude,
            timezone=request.timezone
        )
        
        if request.location_name:
            kundli['birth_details']['location_name'] = request.location_name
        
        return create_success_response(kundli)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=create_error_response("Failed to generate Kundli", str(e))
        )

# ... (keep all other existing endpoints from original routes.py)

# ==========================================
# INFO ENDPOINTS
# ==========================================

@router.get(
    "/info/supported-horoscopes",
    tags=["Info"],
    summary="Get Supported Horoscope Types",
    description="List all supported horoscope types"
)
async def get_supported_horoscopes():
    """Get list of supported horoscope types"""
    return create_success_response({
        'types': horoscope_gen.get_supported_types(),
        'generator_info': horoscope_gen.get_generator_info()
    })

@router.get(
    "/info/signs",
    tags=["Info"],
    summary="Get All Zodiac Signs"
)
async def get_zodiac_signs():
    """Get list of all zodiac signs"""
    return create_success_response({
        'signs': kundli_calc.SIGNS,
        'count': 12
    })

@router.get(
    "/info/nakshatras",
    tags=["Info"],
    summary="Get All Nakshatras"
)
async def get_nakshatras():
    """Get list of all nakshatras"""
    return create_success_response({
        'nakshatras': kundli_calc.NAKSHATRAS,
        'count': 27
    })