from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load the multilingual model and tokenizer
model_name = "tabularisai/multilingual-sentiment-analysis"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

def analyze_sentiment(text):
    print("to analyze the sentiment"+text)
    """Analyze sentiment of the given text and return 'positive', 'negative', or 'neutral'."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Calculate probabilities using softmax
    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
    
    # Define a sentiment map for the model's output classes
    sentiment_map = {0: "Very Negative", 1: "Negative", 2: "Neutral", 3: "Positive", 4: "Very Positive"}
    
    # Get the predicted sentiment index
    sentiment_idx = torch.argmax(probabilities, dim=-1).item()
    
    # Map the prediction to a sentiment label
    sentiment = sentiment_map[sentiment_idx]
    score = probabilities[0, sentiment_idx].item()  # Get the score for the predicted sentiment
    
    # Define thresholds to classify sentiments into 'positive', 'negative', or 'neutral'
    neutral_threshold = 0.4
    
    if sentiment in ['Positive', 'Very Positive'] and score > 0.5:
        return 'positive'
    elif sentiment in ['Negative', 'Very Negative'] and score > 0.5:
        return 'negative'
    elif score < neutral_threshold:
        return 'neutral'
    else:
        return 'neutral'