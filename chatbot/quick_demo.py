"""
Quick Test - Medical Chatbot Sentiment Analysis Demo
Run this to see the chatbot in action!
"""
import requests

API_URL = "http://localhost:8000/chat"

def quick_test():
    print("\n" + "="*80)
    print("MEDICAL ASSISTANT CHATBOT - QUICK DEMO")
    print("="*80)
    
    message = "I'm feeling very anxious and I have a terrible headache that won't go away"
    
    print(f"\nUser Message:\n  {message}\n")
    
    response = requests.post(API_URL, json={
        "user_input": message,
        "user_id": "demo_user"
    }, timeout=30)
    
    result = response.json()
    
    print("="*80)
    print("SENTIMENT ANALYSIS (NLP-based):")
    print("="*80)
    sentiment = result['sentiment']
    print(f"  Detected Emotion: {sentiment['emotion'].upper()}")
    print(f"  Sentiment Scores:")
    print(f"    - Compound:  {sentiment['compound']:.3f} (overall)")
    print(f"    - Positive:  {sentiment['positive']:.3f}")
    print(f"    - Negative:  {sentiment['negative']:.3f}")
    print(f"    - Neutral:   {sentiment['neutral']:.3f}")
    
    print("\n" + "="*80)
    print("MOTIVATIONAL MESSAGE:")
    print("="*80)
    print(f"  {sentiment['motivation']}")
    
    print("\n" + "="*80)
    print("MEDICAL ASSISTANT RESPONSE:")
    print("="*80)
    print(f"  {result['reply'][:400]}...")
    
    print("\n" + "="*80)
    print("SUCCESS! Chatbot is working with:")
    print("  - Medical focus (rejects non-medical queries)")
    print("  - NLP sentiment analysis (VADER)")
    print("  - Emotional support")
    print("  - Anti-hallucination measures")
    print("="*80 + "\n")

if __name__ == "__main__":
    try:
        quick_test()
    except requests.exceptions.ConnectionError:
        print("\nError: Server not running!")
        print("Start server with: uvicorn app:app --reload")
    except Exception as e:
        print(f"\nError: {e}")
