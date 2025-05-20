import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BiomedicalData } from '@/models/BiomedicalData'

interface SearchQuery {
  $or?: Array<{
    [key: string]: RegExp;
  }>;
  'compounds_info.evidence_type'?: string;
  'compounds_info.disease_targeted'?: string;
  'compounds_info.confidence_score'?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const evidenceType = searchParams.get('evidenceType')
    const disease = searchParams.get('disease')
    const confidenceScore = searchParams.get('confidenceScore')

    await connectDB()

    // Build the search query
    const searchQuery: SearchQuery = {}

    if (query) {
      // Create a regex pattern for case-insensitive partial matching
      const regexPattern = new RegExp(query, 'i')
      
      // Search across multiple fields with OR condi1tion
      searchQuery.$or = [
        { compound_name: regexPattern },
        { 'compounds_info.title': regexPattern },
        { 'compounds_info.text_block': regexPattern },
        { 'compounds_info.evidence_description': regexPattern },
        { 'compounds_info.disease_targeted': regexPattern }
      ]
    }

    if (evidenceType) {
      searchQuery['compounds_info.evidence_type'] = evidenceType
    }

    if (disease) {
      searchQuery['compounds_info.disease_targeted'] = disease
    }

    if (confidenceScore) {
      searchQuery['compounds_info.confidence_score'] = confidenceScore
    }

    console.log('Search query:', JSON.stringify(searchQuery, null, 2))

    // Execute the search with proper projection and sorting
    const results = await BiomedicalData.find(searchQuery)
      .sort({ compound_name: 1 })
      .limit(20)
      .lean()

    console.log('Search results:', JSON.stringify(results, null, 2))

    // Ensure each result has the required structure
    const formattedResults = results.map(result => ({
      compound_name: result.compound_name || 'Unnamed Compound',
      compounds_info: Array.isArray(result.compounds_info) ? result.compounds_info : []
    }))

    return NextResponse.json({ results: formattedResults })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
} 