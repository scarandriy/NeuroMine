import os
import requests
from xml.etree import ElementTree

BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
SEARCH_QUERY = (
    "open access[filter] AND ((neuroprotection OR neuroprotective OR neurorescue "
    "OR neurorestoration OR neuroregeneration OR 'neuronal survival' OR neurotrophic) "
    "AND ('small molecule' OR compound OR inhibitor OR activator))"
)
OUTPUT_DIR = "filtered_articles"
MAX_RESULTS = 1000
BATCH_SIZE = 100

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def fetch_article_ids(query, max_results):
    pmc_ids = []
    for start in range(0, max_results, BATCH_SIZE):
        response = requests.get(f"{BASE_URL}/esearch.fcgi", params={
            "db": "pmc",
            "term": query,
            "retmax": BATCH_SIZE,
            "retstart": start
        })
        response.raise_for_status()
        root = ElementTree.fromstring(response.text)
        ids = [id_elem.text for id_elem in root.findall(".//Id")]
        pmc_ids.extend(ids)
    return pmc_ids

def download_article(pmc_id):
    response = requests.get(f"{BASE_URL}/efetch.fcgi", params={
        "db": "pmc",
        "id": pmc_id,
        "rettype": "full",
        "retmode": "xml"
    })
    response.raise_for_status()
    file_path = os.path.join(OUTPUT_DIR, f"{pmc_id}.xml")
    with open(file_path, "wb") as file:
        file.write(response.content)
    print(f"Saved: {pmc_id}")

def main():
    print("Fetching article IDs...")
    pmc_ids = fetch_article_ids(SEARCH_QUERY, MAX_RESULTS)
    print(f"Found {len(pmc_ids)} articles.")

    print("Downloading articles...")
    count = 0
    for pmc_id in pmc_ids:
        try:
            download_article(pmc_id)
            count += 1
        except Exception as e:
            print(f"Error downloading {pmc_id}: {e}")
        if count >= MAX_RESULTS:
            break

    print(f"Download complete. Total saved: {len(os.listdir(OUTPUT_DIR))}")

if __name__ == "__main__":
    main()
