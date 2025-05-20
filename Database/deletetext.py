import os
import re
from bs4 import BeautifulSoup


PROJECT_DIR = "C:\\Users\\Kostya&Son\\Desktop\\Bsp 3" 
XML_DIR = os.path.join(PROJECT_DIR, "filtered_articles") 
RESULT_FILE = os.path.join(PROJECT_DIR, "preprocessed_results1.csv")  
KEYWORDS = [
    "neuroprotection", "neuroprotective", "neurorescue", "neurorestoration",
    "neuroregeneration", "neuronal survival", "neurotrophic",
    "small molecule", "compound", "inhibitor", "activator"
]

def preprocess_text(text):
    text = re.sub(r"\[.*?\]", "", text)  
    text = re.sub(r"[^\w\s.,;:!?()\-]", "", text)  
    text = re.sub(r"\s+", " ", text).strip()  
    return text

def extract_relevant_sentences(text, keywords):
    sentences = []
    for sentence in re.split(r"(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s", text):
        for keyword in keywords:
            if keyword in sentence:
                sentences.append(sentence)
                break
    return sentences

def process_articles(xml_dir, keywords, output_file):
    results = []
    files = os.listdir(xml_dir)

    for file_name in files:
        if file_name.endswith(".xml"):
            file_path = os.path.join(xml_dir, file_name)
            with open(file_path, "r", encoding="utf-8") as file:
                soup = BeautifulSoup(file, "xml")

                title = soup.find("article-title").text if soup.find("article-title") else "No Title"
                abstract = soup.find("abstract").text if soup.find("abstract") else ""
                body = soup.find("body").text if soup.find("body") else ""

                full_text = preprocess_text(abstract + " " + body)
                relevant_sentences = extract_relevant_sentences(full_text, keywords)

                results.append({
                    "file": file_name,
                    "title": title,
                    "sentences": " | ".join(relevant_sentences)
                })

                print(f"Processed: {file_name}, Sentences found: {len(relevant_sentences)}")

    with open(output_file, "w", encoding="utf-8") as out_file:
        out_file.write("file,title,sentences\n")
        for result in results:
            out_file.write(f"{result['file']},{result['title']},\"{result['sentences']}\"\n")

def main():
    print("Starting article processing...")
    process_articles(XML_DIR, KEYWORDS, RESULT_FILE)

if __name__ == "__main__":
    main()
