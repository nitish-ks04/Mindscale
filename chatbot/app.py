import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_message_histories import ChatMessageHistory
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("❌ GOOGLE_API_KEY not found in .env")
os.environ["GOOGLE_API_KEY"] = api_key

sentiment_analyzer = SentimentIntensityAnalyzer()

app = FastAPI(title="Medical Assistant Chatbot API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)

user_memory = {}

def analyze_sentiment(text: str) -> dict:
    """
    Analyzes the sentiment and emotion of the user's input.
    Returns emotion type and sentiment scores.
    """
    scores = sentiment_analyzer.polarity_scores(text)
    compound = scores['compound']
    
    emotion = "neutral"
    motivation = ""
    
    text_lower = text.lower()
    
    anger_keywords = ['angry', 'furious', 'mad', 'frustrated', 'annoyed', 'irritated', 'rage', 'outraged', 'pissed', 'upset']
    
    pain_keywords = ['pain', 'hurt', 'ache', 'suffering', 'agony']
    
    anxiety_keywords = ['anxious', 'worried', 'scared', 'panic', 'nervous', 'fear', 'stress', 'terrified']
    
    sad_keywords = ['sad', 'depressed', 'hopeless', 'lonely', 'crying', 'down', 'miserable', 'grief']
    
    if any(word in text_lower for word in anger_keywords):
        emotion = "frustrated"
        motivation = "I can see you're feeling frustrated. Your feelings are valid. Let's focus on finding solutions that can help you feel better. 🤝"
    
    elif any(word in text_lower for word in pain_keywords):
        emotion = "in pain"
        motivation = "I'm sorry you're experiencing pain. Your wellbeing matters, and I'm here to help you understand your symptoms better. �"
    
    elif any(word in text_lower for word in anxiety_keywords):
        emotion = "anxious"
        motivation = "I understand you're feeling worried. Take a deep breath - you're not alone in this. Let's work through this together, one step at a time. 🌟"
    
    elif any(word in text_lower for word in sad_keywords) or compound < -0.5:
        emotion = "sad"
        motivation = "I can sense you're going through a difficult time. Remember, it's okay to feel this way, and seeking help is a sign of strength. You're taking a positive step by reaching out. 💙"
    
    elif compound > 0.5:
        emotion = "positive"
        motivation = "It's wonderful to see your positive spirit! Let's make sure you stay healthy and well. 😊"
    elif compound > 0.1:
        emotion = "calm"
        motivation = "I'm glad to help you with your health concerns. Your proactive approach to health is commendable. ✨"
    else:
        emotion = "neutral"
        motivation = "I'm here to assist you with your medical questions. Feel free to share your concerns. 🩺"
    
    return {
        "emotion": emotion,
        "compound": compound,
        "positive": scores['pos'],
        "negative": scores['neg'],
        "neutral": scores['neu'],
        "motivation": motivation
    }

# Enhanced hospital database with more specialties
bangalore_hospitals = {
    "emergency": [
        {"name": "Manipal Hospital", "phone": "+91-80-2502-4444", "area": "HAL Airport Road", "specialties": ["Emergency Care", "Trauma", "24/7 Service"]},
        {"name": "Fortis Hospital", "phone": "+91-80-6621-4444", "area": "Bannerghatta Road", "specialties": ["Emergency Care", "Cardiac", "24/7 Service"]},
        {"name": "Apollo Hospital", "phone": "+91-80-2630-0400", "area": "Bannerghatta Road", "specialties": ["Multi-specialty", "Emergency", "24/7 Service"]},
        {"name": "Columbia Asia", "phone": "+91-80-6132-0000", "area": "Whitefield", "specialties": ["Emergency Care", "General", "24/7 Service"]},
    ],
    "cardiac": [
        {"name": "Narayana Health City", "phone": "+91-80-7122-2222", "area": "Bommasandra", "specialties": ["Cardiac Surgery", "Cardiology", "Heart Specialist"]},
        {"name": "Fortis Hospital", "phone": "+91-80-6621-4444", "area": "Bannerghatta Road", "specialties": ["Cardiac Care", "Interventional Cardiology"]},
        {"name": "Apollo Hospital", "phone": "+91-80-2630-0400", "area": "Bannerghatta Road", "specialties": ["Cardiac Care", "Heart Surgery"]},
    ],
    "pediatric": [
        {"name": "Rainbow Children's Hospital", "phone": "+91-80-4967-9999", "area": "Marathahalli", "specialties": ["Pediatrics", "Child Care", "NICU"]},
        {"name": "Manipal Hospital", "phone": "+91-80-2502-4444", "area": "HAL Airport Road", "specialties": ["Pediatrics", "Child Health"]},
        {"name": "Cloudnine Hospital", "phone": "+91-80-6910-6910", "area": "Jayanagar", "specialties": ["Pediatrics", "Maternity", "Child Care"]},
    ],
    "orthopedic": [
        {"name": "Manipal Hospital", "phone": "+91-80-2502-4444", "area": "HAL Airport Road", "specialties": ["Orthopedics", "Sports Medicine", "Joint Replacement"]},
        {"name": "Apollo Hospital", "phone": "+91-80-2630-0400", "area": "Bannerghatta Road", "specialties": ["Orthopedics", "Joint Replacement", "Spine Surgery"]},
        {"name": "Sparsh Hospital", "phone": "+91-80-4344-4444", "area": "Yeshwanthpur", "specialties": ["Orthopedics", "Bone & Joint", "Sports Injuries"]},
    ],
    "dermatology": [
        {"name": "Manipal Hospital", "phone": "+91-80-2502-4444", "area": "HAL Airport Road", "specialties": ["Dermatology", "Skin Care", "Cosmetic Dermatology"]},
        {"name": "Apollo Hospital", "phone": "+91-80-2630-0400", "area": "Bannerghatta Road", "specialties": ["Dermatology", "Skin Specialist"]},
    ],
    "ophthalmology": [
        {"name": "Narayana Nethralaya", "phone": "+91-80-6692-2020", "area": "Rajajinagar", "specialties": ["Eye Care", "Ophthalmology", "Vision Correction"]},
        {"name": "Sankara Eye Hospital", "phone": "+91-80-2663-0800", "area": "Pampa Mahakavi Road", "specialties": ["Eye Care", "Cataract Surgery", "Retina"]},
    ],
    "psychiatry": [
        {"name": "NIMHANS", "phone": "+91-80-2699-5000", "area": "Hosur Road", "specialties": ["Mental Health", "Psychiatry", "Psychology"]},
        {"name": "Manipal Hospital", "phone": "+91-80-2502-4444", "area": "HAL Airport Road", "specialties": ["Psychiatry", "Mental Health", "Counseling"]},
    ],
    "general": [
        {"name": "St. John's Medical College Hospital", "phone": "+91-80-2206-5000", "area": "Koramangala", "specialties": ["General Medicine", "Multi-specialty", "Family Medicine"]},
        {"name": "Victoria Hospital", "phone": "+91-80-2670-1150", "area": "K.R. Market", "specialties": ["Government Hospital", "General", "Multi-specialty"]},
        {"name": "Fortis Hospital", "phone": "+91-80-6621-4444", "area": "Bannerghatta Road", "specialties": ["Multi-specialty", "General Medicine"]},
    ]
}

def detect_complicated_case(text: str) -> bool:
    """
    Detects if the medical case is complicated and needs professional attention
    """
    text_lower = text.lower()
    
    # Serious symptoms that always need medical attention
    serious_keywords = [
        'severe', 'intense', 'unbearable', 'chronic', 'persistent',
        'blood', 'bleeding', 'unconscious', 'seizure', 'stroke',
        'heart attack', 'chest pain', 'difficulty breathing', 'can\'t breathe',
        'suicidal', 'suicide', 'kill myself', 'end my life',
        'broken bone', 'fracture', 'accident', 'injury',
        'high fever', 'very high temperature', 'fever for days',
        'swelling', 'lump', 'growth', 'tumor',
        'vision loss', 'blind', 'can\'t see', 'blurry vision',
        'paralysis', 'can\'t move', 'numbness',
        'vomiting blood', 'blood in stool', 'blood in urine',
        'extreme pain', 'severe pain', 'excruciating',
        'weeks', 'months', 'long time', 'getting worse',
        'pregnant', 'pregnancy', 'miscarriage',
        'allergic reaction', 'allergy', 'rash spreading',
        'infection', 'pus', 'wound', 'cut deep'
    ]
    
    # Emergency keywords
    emergency_keywords = [
        'emergency', 'urgent', 'critical', 'immediately', 'right now',
        '911', '108', 'ambulance', 'help me', 'dying'
    ]
    
    # Check for serious or emergency keywords
    has_serious = any(keyword in text_lower for keyword in serious_keywords)
    has_emergency = any(keyword in text_lower for keyword in emergency_keywords)
    
    # Check for multiple symptoms (indicates complexity)
    symptom_count = text_lower.count('and') + text_lower.count(',')
    multiple_symptoms = symptom_count >= 2
    
    return has_serious or has_emergency or multiple_symptoms

def detect_location_and_specialty(text: str) -> dict:
    """
    Detects if user is asking for Bangalore hospitals and what specialty
    Also detects if case is complicated
    """
    text_lower = text.lower()
    
    # Check for Bangalore mentions
    bangalore_keywords = ['bangalore', 'bengaluru', 'blr', 'karnataka']
    is_bangalore = any(keyword in text_lower for keyword in bangalore_keywords)
    
    # Check for hospital/doctor request
    medical_facility_keywords = ['hospital', 'doctor', 'clinic', 'medical center', 'specialist', 'physician', 'surgeon']
    wants_facility = any(keyword in text_lower for keyword in medical_facility_keywords)
    
    # Check if case is complicated
    is_complicated = detect_complicated_case(text)
    
    # Detect specialty
    specialty = "general"
    if any(word in text_lower for word in ['heart', 'cardiac', 'chest pain', 'heart attack', 'palpitation']):
        specialty = "cardiac"
    elif any(word in text_lower for word in ['child', 'baby', 'pediatric', 'kid', 'infant', 'toddler']):
        specialty = "pediatric"
    elif any(word in text_lower for word in ['bone', 'fracture', 'joint', 'orthopedic', 'accident', 'injury', 'sprain']):
        specialty = "orthopedic"
    elif any(word in text_lower for word in ['emergency', 'urgent', 'immediate', '911', '108', 'critical', 'severe']):
        specialty = "emergency"
    elif any(word in text_lower for word in ['skin', 'rash', 'acne', 'dermatology', 'itch']):
        specialty = "dermatology"
    elif any(word in text_lower for word in ['eye', 'vision', 'ophthalmology', 'blind', 'see']):
        specialty = "ophthalmology"
    elif any(word in text_lower for word in ['mental', 'depression', 'anxiety', 'psychiatry', 'therapy']):
        specialty = "psychiatry"
    
    return {
        "is_bangalore": is_bangalore,
        "wants_facility": wants_facility,
        "specialty": specialty,
        "is_complicated": is_complicated
    }

def format_hospital_recommendations(specialty: str, is_complicated: bool = False) -> str:
    """
    Format hospital recommendations for Bangalore
    """
    hospitals = bangalore_hospitals.get(specialty, bangalore_hospitals["general"])
    
    # Add urgency message for complicated cases
    urgency_msg = ""
    if is_complicated:
        urgency_msg = "\n⚠️ **IMPORTANT:** Your symptoms appear serious. Please seek medical attention promptly.\n"
    
    response = f"{urgency_msg}\n**🏥 Recommended Hospitals & Doctors in Bangalore ({specialty.title()}):**\n\n"
    
    for idx, hospital in enumerate(hospitals, 1):
        response += f"{idx}. **{hospital['name']}**\n"
        response += f"   📞 Phone: {hospital['phone']}\n"
        response += f"   📍 Location: {hospital['area']}, Bangalore\n"
        response += f"   🩺 Specialties: {', '.join(hospital['specialties'])}\n\n"
    
    response += "\n💡 **Next Steps:**\n"
    response += "   • Call ahead to book an appointment\n"
    response += "   • Mention your symptoms when calling\n"
    response += "   • Ask for the earliest available slot\n"
    
    if is_complicated:
        response += "   • **If symptoms worsen, call emergency services (108) immediately**\n"
    
    return response

medical_system_template = """
You are a **Professional Medical Assistant AI** designed to provide helpful, accurate, and empathetic medical information.

STRICT GUIDELINES:
1. **ONLY answer medical and health-related questions** including:
   - Symptoms analysis and possible conditions
   - General health advice and wellness tips
   - Medication information (general knowledge)
   - Preventive care and healthy lifestyle
   - Mental health support and guidance
   - First aid recommendations
   - When to seek emergency care
   - **Hospital and doctor recommendations in Bangalore** (when asked)

2. **If asked about NON-MEDICAL topics**, respond STRICTLY with:
   "I apologize, but I can only assist with medical and health-related concerns. Please ask me about symptoms, health conditions, wellness, or medical advice."

3. **NEVER hallucinate or make up information**:
   - Only provide information based on established medical knowledge
   - If uncertain, clearly state: "I'm not completely certain about this. Please consult a healthcare professional for accurate diagnosis."
   - Always recommend consulting a doctor for serious symptoms or diagnosis

4. **IMPORTANT DISCLAIMERS**:
   - You are NOT a replacement for professional medical care
   - For emergencies (chest pain, difficulty breathing, severe bleeding, etc.), ALWAYS advise: "This sounds like an emergency. Please call emergency services (108 in India) or visit the nearest emergency room immediately."
   - For serious symptoms, ALWAYS recommend: "Please consult with a healthcare provider for proper examination and diagnosis."

5. **Be Empathetic and Supportive**:
   - Current user emotion: {emotion}
   - Acknowledge their feelings appropriately
   - Provide emotional support alongside medical information
   - Use a caring, professional tone

6. **Location-Specific Recommendations**:
   - If user asks for Bangalore hospitals/doctors, hospital recommendations will be provided separately
   - Focus your medical advice on the health concern itself
   - Acknowledge the hospital list will follow your response

7. **Response Format - BE RELEVANT AND FOCUSED**:
   - Provide all RELEVANT information needed to answer the question
   - Avoid unnecessary background information or explanations
   - Skip lengthy introductions - get to the point quickly
   - Don't explain basic concepts unless specifically asked
   - Avoid repetitive statements or over-explaining
   - Use bullet points when listing multiple items (symptoms, tips, etc.)
   - Be clear and easy to understand
   - Explain medical terms if used, but keep explanations brief
   - Provide actionable advice when safe to do so
   - Focus on what the user needs to know, not everything you could say

EMOTIONAL CONTEXT:
User's current emotional state: {emotion}
Motivational message: {motivation}

CONVERSATION HISTORY:
{chat_history}

USER'S MEDICAL CONCERN:
{user_input}

ASSISTANT'S CONCISE RESPONSE:
"""

def unified_chat(user_input: str, user_id: str = None, detail_mode: str = "concise"):
    try:
        sentiment_data = analyze_sentiment(user_input)
        location_data = detect_location_and_specialty(user_input)
        
        if user_id not in user_memory:
            user_memory[user_id] = {
                "history": ChatMessageHistory(),
                "sentiment_history": []
            }
        
        memory_data = user_memory[user_id]
        memory = memory_data["history"]
        
        memory_data["sentiment_history"].append({
            "emotion": sentiment_data["emotion"],
            "compound": sentiment_data["compound"]
        })
        
        chat_history = ""
        for msg in memory.messages[-10:]:  
            role = "User" if msg.type == "human" else "Assistant"
            chat_history += f"{role}: {msg.content}\n"
    
        prompt = ChatPromptTemplate.from_template(medical_system_template)
        formatted_prompt = prompt.format(
            chat_history=chat_history, 
            user_input=user_input,
            emotion=sentiment_data["emotion"],
            motivation=sentiment_data["motivation"]
        )
        
        response = llm.invoke(formatted_prompt)
        final_response = response.content.strip()
        
        # Auto-suggest hospitals for complicated cases OR if explicitly asked for Bangalore facilities
        should_recommend = (
            location_data["is_complicated"] or  # Complicated case
            (location_data["is_bangalore"] and location_data["wants_facility"])  # Explicit request
        )
        
        if should_recommend:
            hospital_list = format_hospital_recommendations(
                location_data["specialty"], 
                location_data["is_complicated"]
            )
            final_response += "\n\n" + hospital_list
        
        memory.add_user_message(user_input)
        memory.add_ai_message(final_response)
        
        return {
            "reply": final_response,
            "sentiment": sentiment_data,
            "location_context": location_data,
            "recommended_hospitals": should_recommend
        }

    except Exception as e:
        if "quota" in str(e).lower() or "429" in str(e):
            return {
                "reply": "⚠️ Google Gemini API quota exceeded. Please check your API key or wait a minute.",
                "sentiment": {"emotion": "neutral", "compound": 0}
            }
        return {
            "reply": f"❌ Error: {str(e)}",
            "sentiment": {"emotion": "neutral", "compound": 0}
        }

class ChatRequest(BaseModel):
    user_input: str
    user_id: str | None = None
    detail_mode: str = "concise"

@app.post("/chat")
def chat(req: ChatRequest):
    """
    Medical Assistant Chatbot Endpoint
    Handles medical queries with sentiment analysis and emotional support.
    Returns both medical advice and sentiment analysis.
    """
    if not req.user_input.strip():
        raise HTTPException(status_code=400, detail="User input cannot be empty")

    result = unified_chat(req.user_input, req.user_id, req.detail_mode)
    return result

@app.get("/")
def root():
    return {
        "status": "Medical Assistant Chatbot API running 🏥",
        "features": [
            "Medical Q&A",
            "Sentiment Analysis",
            "Emotional Support",
            "Context-aware responses"
        ]
    }

@app.get("/sentiment/{user_id}")
def get_sentiment_history(user_id: str):
    """
    Get sentiment history for a specific user
    """
    if user_id not in user_memory:
        return {"sentiment_history": []}
    
    return {"sentiment_history": user_memory[user_id]["sentiment_history"]}
