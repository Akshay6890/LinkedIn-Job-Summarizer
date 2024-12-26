from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import json
from datetime import datetime, timezone
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from collections import Counter

# Download required NLTK datasets
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')

app = Flask(__name__)

CORS(app)

s3 = boto3.client('s3', region_name='<give_region>',
                  aws_access_key_id='<give_secret_key',
                  aws_secret_access_key='<give_access_key')
BUCKET_NAME = "<give_bucket_name>"


def summarize_text(texts, summary_length=3):
    """Summarize a combined text from a list of input texts by extracting important sentences."""
    # Combine all texts into a single string
    combined_text = ' '.join(texts)
    
    # Tokenize combined text into sentences
    sentences = sent_tokenize(combined_text)
    
    # Tokenize the combined text into words and remove stop words
    stop_words = set(stopwords.words("english"))
    words = word_tokenize(combined_text.lower())
    
    # Remove stop words and non-alphabetic tokens
    filtered_words = [word for word in words if word.isalpha() and word not in stop_words]
    
    # Calculate word frequency
    word_freq = Counter(filtered_words)
    
    # Score each sentence based on word frequency
    sentence_scores = {}
    for sentence in sentences:
        words_in_sentence = word_tokenize(sentence.lower())
        score = sum(word_freq[word] for word in words_in_sentence if word in word_freq)
        sentence_scores[sentence] = score
    
    # Sort sentences by score and select top ones
    ranked_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)
    
    # Get top sentences for the combined summary
    combined_summary = ' '.join(ranked_sentences[:summary_length])
    
    return combined_summary

@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        # Parse request JSON
        data = request.json
        job_id = data['job_id']
        new_feedback = data['feedback']

        # Define the key for the S3 object
        key = f"feedback/{job_id}.json"


        feedback_list = {}
        feedback_values=[]

        try:
            # Retrieve existing data from S3
            response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
            existing_data = response['Body'].read().decode('utf-8')
            feedback_list = json.loads(existing_data)

        except s3.exceptions.NoSuchKey:
            # If the file doesn't exist, initialize `feedback_list` with default structure
            feedback_list = {}

        if not bool(feedback_list):
            feedback_values.append(new_feedback)
        else:
            feedback_values=feedback_list["feedback"]
            feedback_values.append(new_feedback)


        # Save the updated feedback to S3
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=json.dumps({"feedback": feedback_values}),
            ContentType='application/json'
        )

        return jsonify({"message": "Feedback updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-summary', methods=['GET'])
def get_summary():

    job_id = request.args.get('job_id')

    # Define the key for the S3 object
    key = f"feedback/{job_id}.json"

    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
        existing_data = response['Body'].read().decode('utf-8')
        feedback_list = json.loads(existing_data)
        feedback_values=feedback_list["feedback"]
        summary = summarize_text(feedback_values, summary_length=3)

        return jsonify({"message": f"{summary}"}), 200

    except s3.exceptions.NoSuchKey:
        return jsonify({"error": "Not enough data on this job posting!"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)