"""
Test script for Medical Assistant Chatbot
Tests sentiment analysis and medical responses
"""
import requests
import json

API_URL = "http://localhost:8000/chat"

def test_chatbot(message, user_id="test_user_123"):
    """Send a message to the chatbot and display the response"""
    payload = {
        "user_input": message,
        "user_id": user_id
    }
    
    print(f"\n{'='*80}")
    print(f"USER: {message}")
    print(f"{'='*80}")
    
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        
        print(f"\n📊 SENTIMENT ANALYSIS:")
        sentiment = data.get('sentiment', {})
        print(f"   Emotion: {sentiment.get('emotion', 'N/A')}")
        print(f"   Compound Score: {sentiment.get('compound', 0):.3f}")
        print(f"   Positive: {sentiment.get('positive', 0):.3f}")
        print(f"   Negative: {sentiment.get('negative', 0):.3f}")
        print(f"   Neutral: {sentiment.get('neutral', 0):.3f}")
        
        print(f"\n💬 MOTIVATION:")
        print(f"   {sentiment.get('motivation', 'N/A')}")
        
        print(f"\n🏥 MEDICAL ASSISTANT RESPONSE:")
        print(f"   {data.get('reply', 'No response')}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")

def main():
    print("=" * 80)
    print("🏥 MEDICAL ASSISTANT CHATBOT - TEST SUITE")
    print("=" * 80)
    
    # Test cases covering different emotions and medical scenarios
    test_cases = [
        # Sad/Depressed
        "I've been feeling really sad and depressed lately. I can't sleep well.",
        
        # Anxious
        "I'm very anxious about my upcoming surgery. What should I expect?",
        
        # Pain
        "I have a severe headache that won't go away. It's been 3 days.",
        
        # Positive/Healthy
        "I've been eating healthy and exercising! How can I maintain this?",
        
        # Neutral medical query
        "What are the symptoms of high blood pressure?",
        
        # Emergency scenario
        "I'm having severe chest pain and difficulty breathing",
        
        # Non-medical (should be rejected)
        "What's the weather like today?",
        
        # Mental health
        "I'm struggling with anxiety and panic attacks. What can help me?"
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n\n{'#'*80}")
        print(f"TEST CASE {i}/{len(test_cases)}")
        print(f"{'#'*80}")
        test_chatbot(test_case)
        
        if i < len(test_cases):
            input("\nPress Enter to continue to next test case...")
    
    print(f"\n\n{'='*80}")
    print("✅ ALL TESTS COMPLETED")
    print("="*80)

if __name__ == "__main__":
    main()
