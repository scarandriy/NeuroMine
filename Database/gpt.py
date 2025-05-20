import openai
import csv
from pymongo import MongoClient, ASCENDING
import json
import os
import sys

csv.field_size_limit(10485760)

openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    print("OpenAI API key not found. Set OPENAI_API_KEY environment variable.")
    sys.exit(1)

client = MongoClient("mongodb://localhost:27017/")
db = client["neuro_db"]
collection = db["articles"]

desired_index = [("compound_name", ASCENDING)]
existing_indexes = collection.index_information()
index_name = "compound_name_1"

if not any(details['key'] == desired_index for details in existing_indexes.values()):
    collection.create_index(desired_index, unique=True, name=index_name)
    print("MongoDB connected. Unique index on 'compound_name' created.")


def classify_text_block(text_block):
    prompt = f"""
Extract relevant information:
1. Compound name, structure, and identifier.
2. Description of in-vitro/in-vivo evidence.
3. Disease targeted (optional).
4. Mechanism of action (optional).
5. References (DOI, article title).
6. Confidence score and validation status (optional).

If no relevant data, return:
{{"message": "No relevant information"}}

Text: "{text_block}"

Output JSON format:
{{
    "compound_name": "",
    "structure": "",
    "identifier": "",
    "evidence_description": "",
    "evidence_type": "",
    "disease_targeted": "",
    "mechanism_of_action": "",
    "references": "",
    "manual_validation": ""
}}
"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.3
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"OpenAI API error: {e}. Skipping block.")
        return None


def parse_to_json(raw_response):
    if not raw_response:
        return []
    try:
        return json.loads(raw_response) if "No relevant information" not in raw_response else []
    except json.JSONDecodeError:
        print(f"JSON parsing error: {raw_response}. Skipping.")
        return []


def process_csv(input_csv):
    try:
        with open(input_csv, "r", encoding="utf-8") as infile:
            reader = csv.DictReader(infile)
            for row_number, row in enumerate(reader, start=1):
                file_name, text_field, title = row.get("file", "").strip(), row.get("sentences", "").strip(), row.get("title", "Unknown Title").strip()
                if not file_name or not text_field:
                    print(f"[Row {row_number}] Skipped due to missing data.")
                    continue
                
                text_blocks = [block.strip() for block in text_field.split('\n') if block.strip()] or [text_field]
                for block_number, text_block in enumerate(text_blocks, start=1):
                    print(f"[Row {row_number}, Block {block_number}] Processing...")
                    raw_response = classify_text_block(text_block)
                    if not raw_response:
                        print(f"[Row {row_number}, Block {block_number}] No response. Skipping.")
                        continue
                    
                    parsed_data = parse_to_json(raw_response)
                    for compound in parsed_data:
                        compound_name = compound.get("compound_name")
                        if not compound_name:
                            print(f"[Row {row_number}, Block {block_number}] Missing 'compound_name'. Skipping.")
                            continue
                        
                        compounds_info = {
                            "file_name": file_name,
                            "title": title,
                            "text_block": text_block,
                            "structure": compound.get("structure"),
                            "identifier": compound.get("identifier"),
                            "evidence_description": compound.get("evidence_description"),
                            "evidence_type": compound.get("evidence_type"),
                            "disease_targeted": compound.get("disease_targeted"),
                            "mechanism_of_action": compound.get("mechanism_of_action"),
                            "references": compound.get("references"),
                            "confidence_score": compound.get("confidence_score"),
                            "manual_validation": compound.get("manual_validation")
                        }
                        
                        collection.update_one({"compound_name": compound_name}, {"$push": {"compounds_info": compounds_info}}, upsert=True)
                        print(f"[Row {row_number}, Block {block_number}] Inserted/Updated: {compound_name}")
        print("CSV processing complete.")
    except FileNotFoundError:
        print(f"CSV file not found: {input_csv}")
    except Exception as e:
        print(f"CSV processing error: {e}")


def calculate_confidence_score():
    try:
        for doc in collection.find():
            compound_name = doc.get("compound_name")
            compounds_info = doc.get("compounds_info", [])
            
            if not compounds_info:
                continue
            
            num_sources = len(compounds_info)
            unique_mechanisms = {info.get("mechanism_of_action") for info in compounds_info if info.get("mechanism_of_action")}
            confidence_score = "High" if num_sources > 5 and len(unique_mechanisms) == 1 else "Medium" if num_sources > 2 and len(unique_mechanisms) <= 2 else "Low"
            
            collection.update_one({"compound_name": compound_name}, {"$set": {"confidence_score": confidence_score}})
            print(f"Updated confidence_score for {compound_name}: {confidence_score}")
    except Exception as e:
        print(f"Confidence score calculation error: {e}")


if __name__ == "__main__":
    file_path = r'C:\Users\Kostya&Son\Desktop\Bsp 3\preprocessed_results1.csv'
    process_csv(file_path)
    print("Starting confidence score calculation...")
    calculate_confidence_score()
    print("Processing complete.")
