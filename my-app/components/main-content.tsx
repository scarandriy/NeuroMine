"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Search, Filter, FileText, Settings2, Database, Type, Moon, Sun, Microscope, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

interface CompoundInfo {
  title?: string;
  text_block?: string;
  evidence_description?: string;
  disease_targeted?: string;
  evidence_type?: string;
  confidence_score?: string;
}

interface SearchResult {
  compound_name: string;
  compounds_info: CompoundInfo[];
}

export function MainContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [evidenceType, setEvidenceType] = useState("")
  const [disease, setDisease] = useState("")
  const [confidenceScore, setConfidenceScore] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState(0)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('query', searchQuery)
      if (evidenceType) params.append('evidenceType', evidenceType)
      if (disease) params.append('disease', disease)
      if (confidenceScore) params.append('confidenceScore', confidenceScore)

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = () => {
    setEvidenceType("")
    setDisease("")
    setConfidenceScore("")
    setActiveFilters(0)
  }

  const updateActiveFilters = useCallback(() => {
    let count = 0
    if (evidenceType) count++
    if (disease) count++
    if (confidenceScore) count++
    setActiveFilters(count)
  }, [evidenceType, disease, confidenceScore])

  // Update active filters count when filters change
  useEffect(() => {
    updateActiveFilters()
  }, [evidenceType, disease, confidenceScore, updateActiveFilters])

  return (
    <main className="w-full min-h-screen bg-background">
      {/* Header */}
      <div className="border-b w-full">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <span className="text-xl font-bold">NeuroMine</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuItem>About</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Search Section */}
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold tracking-tighter">Biomedical Search</CardTitle>
              <CardDescription className="text-lg">Search through biomedical compounds and their effects</CardDescription>
            </CardHeader>
          </Card>

          {/* Search Bar */}
          <Card className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for compounds, diseases, or effects..."
                    className="pl-10 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  className="px-8 h-12"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                </div>
                <Badge variant="secondary" className="ml-2">{activeFilters} Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Microscope className="h-4 w-4" />
                    Evidence Type
                  </label>
                  <Select value={evidenceType} onValueChange={setEvidenceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-vitro">In Vitro</SelectItem>
                      <SelectItem value="in-vivo">In Vivo</SelectItem>
                      <SelectItem value="clinical">Clinical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Disease
                  </label>
                  <Select value={disease} onValueChange={setDisease}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disease" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alzheimer&apos;s disease">Alzheimer&apos;s Disease</SelectItem>
                      <SelectItem value="Cancer">Cancer</SelectItem>
                      <SelectItem value="Diabetes">Diabetes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Confidence Score
                  </label>
                  <Select value={confidenceScore} onValueChange={setConfidenceScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleResetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <CardTitle>Search Results</CardTitle>
                  <Badge variant="secondary" className="ml-2">{results.length} Results</Badge>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-[125px] w-full" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <Card key={index} className="p-4">
                        <h3 className="text-lg font-semibold">{result.compound_name || 'Unnamed Compound'}</h3>
                        {Array.isArray(result.compounds_info) ? (
                          result.compounds_info.map((info: CompoundInfo, infoIndex: number) => (
                            <div key={infoIndex} className="mt-4 space-y-2">
                              <p className="text-sm font-medium">{info.title || 'No Title'}</p>
                              <p className="text-sm text-muted-foreground">{info.evidence_description || 'No Description'}</p>
                              <div className="flex gap-2 mt-2">
                                {info.evidence_type && (
                                  <Badge variant="secondary">{info.evidence_type}</Badge>
                                )}
                                {info.disease_targeted && (
                                  <Badge variant="secondary">{info.disease_targeted}</Badge>
                                )}
                                {info.confidence_score && (
                                  <Badge variant="secondary">{info.confidence_score}</Badge>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm text-muted-foreground">No additional information available</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No results found' : 'Enter your search query to see results'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
} 